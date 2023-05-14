import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

import { Auth } from 'src/auth/auth.entity';
import { AuthService } from 'src/auth/auth.service';
import { FriendRequestService } from 'src/friend-request/friend-request.service';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private readonly authService: AuthService,
        private readonly friendService: FriendRequestService,
    ) {}

    async getUser(id: number, self: boolean = false): Promise<User> {
        const user = await this.userRepository.findOne({
            where: {
                id: id
            },
            relations: {
                auths: self,
                friends: self,
                sentRequests: self,
                receivedRequests: self,
                blocked: self,
            }
        })
        if (!user) {
            throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);
        }
        return user;
    }

    async getUserByUsername(username: string): Promise<User> {
        const user: User = await this.userRepository.findOne({
            where: {
                display_name: username
            }
        })
        if (!user) {
            throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);
        }
        return user;
    }

    async setUsername(id: number, username: string) {
        const other: User = await this.userRepository.findOne({
            where: {
                display_name: username
            }
        })
        if (other && other.id != id) {
            throw new HttpException("Username already taken", HttpStatus.CONFLICT);
        }

        const user: User = await this.getUser(id);

        user.display_name = username;
        await this.userRepository.save(user)
    }

    async setPicture(id: number, picture: string) {
        const user: User = await this.getUser(id);

        user.profile_picture = picture;
        await this.userRepository.save(user)
    }

    async leaderboard() {
        const users: User[] = await this.userRepository.find({
            order: {
                points: "DESC"
            },
            skip: 0,
            take: 10
        })
        return users;
    }

    async register(method: string, data): Promise<string> {
        const { username } = data;
        if (typeof username !== 'string') {
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        }
        if (await this.userRepository.findOne({
            where: {
                display_name: username
            }
        })) {
            throw new HttpException("Username already taken", HttpStatus.CONFLICT);
        }

        const user: User = new User();
        user.auths = new Array<Auth>;
        user.display_name = username;

        switch (method) {
            case 'local': {
                const { password } = data;
                user.auths.push(await this.authService.registerLocal(user, username, password));
                break;
            }
            case '42': {
                user.auths.push(await this.authService.register42(user, username));
                break;
            }
            default: {
                throw new HttpException("Unknown method", HttpStatus.METHOD_NOT_ALLOWED);
            }
        }

        await this.userRepository.save(user);
        return this.authService.getJwt(user);
    }

    async login(method: string, data) : Promise<string> {
        let user: User;

        switch (method) {
            case 'local': {
                const { username, password } = data;
                user = await this.authService.loginLocal(username, password);
                break;
            }
            default: {
                return this.loginOrRegister(method, data);
            }
        }

        return this.authService.getJwt(user);
    }

    private async loginOrRegister(method: string, data) : Promise<string> {
        let username: string = await this.authService.getUsername(method, data);

        data.username = username;
        const exist: boolean = await this.authService.exist(method, username) ;
        if (!exist) {
            return this.register(method, data);
        }

        let user: User;
        switch (method) {
            case '42': {
                user = await this.authService.login42(username);
                break;
            }
            default: {
                throw new HttpException("Unknown method", HttpStatus.METHOD_NOT_ALLOWED);
            }
        }

        return this.authService.getJwt(user);
    }

    async addFriend(requesterId: number, receiverId: number)
    {
        const requester: User = await this.getUser(requesterId, true);
        
        requester.friends.forEach( (e) => {
            if (e.id == receiverId) {
                throw new HttpException("Already friend", HttpStatus.CONFLICT)
            }
        })
        
        const receiver: User = await this.getUser(receiverId, true);

        if (this.isBlocked(receiver, requester.id) || this.isBlocked(requester, receiver.id)) {
            throw new HttpException("User is blocked", HttpStatus.FORBIDDEN);
        }

        if (await this.friendService.hasRequest(requester, receiver)) {
            await this.friendService.accept(requester, receiver)

            requester.friends.push(receiver);
            receiver.friends.push(requester);
            await this.userRepository.save(requester);
            await this.userRepository.save(receiver);
        }
        else {
            await this.friendService.send(requester, receiver);
        }
    }

    async rejectFriend(selfId: number, fromId: number) {
        const self: User = await this.getUser(selfId, true);
        const from: User = await this.getUser(fromId, true);

        await this.friendService.reject(self, from);
    }

    async removeFriend(selfId: number, otherId: number) {
        const self: User = await this.getUser(selfId, true);
        
        if (!self.friends.some(e => e.id == otherId)) {
            throw new HttpException("Friend not found", HttpStatus.NOT_FOUND)
        }

        const other: User = await this.getUser(otherId, true);

        self.friends = self.friends.filter(e => e.id != otherId);
        other.friends = other.friends.filter(e => e.id != selfId);

        await this.userRepository.save(self);
        await this.userRepository.save(other);
    }

    async blockUser(self: User, other: User) {
        if (this.isBlocked(self, other.id)) {
            throw new HttpException("Already blocked", HttpStatus.CONFLICT);
        }

        self.blocked.push(other);
        self.friends = self.friends.filter(e => e.id != other.id);
        other.friends = other.friends.filter(e => e.id != self.id);

        if (await this.friendService.hasRequest(self, other)) {
            await this.friendService.reject(self, other);
        }
        else if (await this.friendService.hasRequest(other, self)) {
            await this.friendService.reject(other, self);
        }

        await this.userRepository.save(self);
        await this.userRepository.save(other);
    }

    async unblockUser(self: User, other: User) {
        if (!this.isBlocked(self, other.id)) {
            throw new HttpException("User not blocked", HttpStatus.NOT_FOUND);
        }

        self.blocked = self.blocked.filter(e => e.id != other.id);

        await this.userRepository.save(self);
    }

    isBlocked(self: User, userId: number): boolean {
        return self.blocked.some(e => e.id == userId);
    }
}
