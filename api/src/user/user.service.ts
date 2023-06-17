import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

import { Auth } from 'src/auth/auth.entity';
import { AuthService } from 'src/auth/auth.service';
import { FriendRequestService } from 'src/friend-request/friend-request.service';
import { FriendRequest } from 'src/friend-request/friend-request.entity';

import { toDataURL } from 'qrcode';
import { Game } from 'src/game/game.entity';

import { SocketServer } from 'src/socket/socket.server';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private readonly authService: AuthService,
        private readonly friendService: FriendRequestService,
    ) {}

    async getUser(id: number, self: boolean = false, withGames = false): Promise<User> {
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
                game: withGames,
            }
        })
        if (!user) {
            throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);
        }

        if (self) 
        {
            for (let i = 0; i < user.friends.length; i++)
                user.friends[i] = await this.getUser(user.friends[i].id, false, true);
        }

        if (!self)
            delete user.twoFaSecret;

        if (this.isOnline(user.id) == true)
            user["status"] = "online";
        else
            user["status"] = "offline";

        return user;
    }

    isOnline(userId: number): boolean
    {
        const websocket = SocketServer.instance();

        if (websocket == null || websocket == undefined)
            return false;

        for (const client of websocket.clients) {
            if (client.data.user == userId)
                return true;
        }
        return false;
    }

    async getUserByUsername(username: string, blocked: boolean = false): Promise<User> {
        const user: User = await this.userRepository.findOne({
            where: {
                display_name: username
            },
            relations: {
                blocked: blocked
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

    async register(method: string, data): Promise<{ token: string, twoFaEnabled: boolean}> {
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
        return { token: this.authService.getJwt(user), twoFaEnabled: user.twoFaEnabled };
    }

    async login(method: string, data) : Promise<{ token: string, twoFaEnabled: boolean}> {
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

        return { token: this.authService.getJwt(user), twoFaEnabled: user.twoFaEnabled };
    }

    async login2fa(id: number, code: string, withEnable: boolean = false) : Promise<string>
    {
        const user: User = await this.getUser(id, true);

        if (!user.twoFaEnabled && !withEnable)
            throw new HttpException("2fa not enabled", HttpStatus.BAD_REQUEST);

        if (user.twoFaSecret == "")
            throw new HttpException("2fa not enabled", HttpStatus.BAD_REQUEST);

        if (!this.authService.is2faCodeValid(user, code))
            throw new HttpException("Invalid code", HttpStatus.UNAUTHORIZED);

        if (!user.twoFaEnabled)
        {
            user.twoFaEnabled = true;
            await this.userRepository.save(user);
        }

        return this.authService.getJwt(user, true);
    }

    async generate2fa(id: number)
    {
        const user: User = await this.getUser(id);

        if (user.twoFaEnabled)
            throw new HttpException("2fa already enabled", HttpStatus.BAD_REQUEST);

        const { secret, url } = this.authService.generate2faSecret(user);

        user.twoFaSecret = secret;
        await this.userRepository.save(user);

        return await toDataURL(url);
    }

    async disable2fa(id: number)
    {
        const user: User = await this.getUser(id);

        user.twoFaSecret = "";
        user.twoFaEnabled = false;
        this.userRepository.save(user);
    }

    private async loginOrRegister(method: string, data) : Promise<{ token: string, twoFaEnabled: boolean}> {
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

        return { token: this.authService.getJwt(user), twoFaEnabled: user.twoFaEnabled };
    }

    async getFriendRequestUser(user: User, requestId: number) : Promise<Object>
    {
        const req: FriendRequest = await this.friendService.get(requestId);

        let other: User;
        if (req.requester.id == user.id) {
            other = await this.getUser(req.receiver.id);
        }
        else {
            other = await this.getUser(req.requester.id);
        }

        return { id: other.id, display_name: other.display_name };
    }

    async addFriend(requesterId: number, receiverId: number)
    {
        if (requesterId == receiverId) {
            throw new HttpException("Cannot add yourself", HttpStatus.CONFLICT);
        }

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
