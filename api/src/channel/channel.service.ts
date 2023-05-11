import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { Channel } from './channel.entity';

import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ChannelService {
    constructor(
        @InjectRepository(Channel)
        private channelRepository: Repository<Channel>,
        private readonly userService: UserService,
    ) {}

    async listPublic() {
        const channels: Channel[] = await this.channelRepository.find({
            where: {
                type: 'public'
            },
            select: {
                id: true,
                display_name: true,
            }
        });
        return channels;
    }

    async listSelfChannel(user: User) {
        const channels: Channel[] = await this.channelRepository.createQueryBuilder('channel')
            .leftJoinAndSelect('channel.users', 'user')
            .where('user.id = :userId', { userId: user.id })
            .select(['channel.id', 'channel.display_name'])
            .getMany();
        return channels;
    }

    async getChannelInfo(user: User, channelId: number) {
        const channel: Channel = await this.getChannel(channelId, true);
        
        if (!channel.users.some(e => e.id == user.id)) {
            throw new HttpException("User not in channel", HttpStatus.FORBIDDEN);
        }

        delete channel.password_hash;
        return channel;
    }

    async joinChannel(self: User, channelId: number, data) {
        const channel: Channel = await this.getChannel(channelId, true);

        if (channel.type == 'dm') {
            throw new HttpException("Invalid channel", HttpStatus.FORBIDDEN);
        }
        if (channel.type == 'public' && channel.password_hash != null) {
            let password: string = data['password'];
            if (typeof password !== 'string') {
                throw new HttpException("password required", HttpStatus.FORBIDDEN);
            }

            const valid = await bcrypt.compare(password, channel.password_hash)
            if (!valid) {
                throw new HttpException("Invalid password", HttpStatus.FORBIDDEN);
            }
        }

        if (channel.users.some(e => e.id == self.id)) {
            throw new HttpException("User already in channel", HttpStatus.CONFLICT)
        }

        channel.users.push(self);
        return this.channelRepository.save(channel);
    }

    async leaveChannel(self: User, channelId: number) {
        const channel: Channel = await this.getChannel(channelId, true);

        if (!channel.users.some(e => e.id == self.id)) {
            throw new HttpException("User not in channel", HttpStatus.NOT_FOUND)
        }

        channel.users = channel.users.filter(e => e.id != self.id);

        if (channel.users.length == 0) {
            return this.deleteChannel(channelId);
        }

        channel.admins = channel.admins.filter(e => e.id != self.id);

        if (channel.owner && channel.owner.id == self.id) {
            channel.owner = channel.users[0];
        }

        return this.channelRepository.save(channel);
    }

    async deleteChannel(channelId: number) {
        const channel: Channel = await this.getChannel(channelId);

        return this.channelRepository.remove(channel)
    }

    async createChannel(owner: User, type: string, data): Promise<Channel> {
        switch (type) {
            case 'dm': {
                if (typeof data["other"] !== 'number') {
                    throw new HttpException("", HttpStatus.BAD_REQUEST);
                }
                const other: User = await this.userService.getUser(data["other"]);
                return this.createDm(owner, other);
            }
            case 'public': {
                return this.createPublic(owner, data["name"], data["password"]);
            }
            case 'private': {
                return this.createPrivate(owner, data["name"]);
            }
            default: {
                throw new HttpException("", HttpStatus.BAD_REQUEST);
            }
        }
    }

    private async createDm(self: User, other: User): Promise<Channel> {
        if (await this.dmExist([self, other])) {
            throw new HttpException("", HttpStatus.CONFLICT)
        }

        const channel: Channel = new Channel()
        channel.type = "dm";
        channel.users = [self, other]

        await this.channelRepository.save(channel)
        return channel;
    }

    private async createPublic(owner: User, name: string, password: string): Promise<Channel> {
        if (typeof name !== 'string' || name.length < 3) {
            throw new HttpException("", HttpStatus.BAD_REQUEST)
        }

        if (await this.channelExist(name)) {
            throw new HttpException("", HttpStatus.CONFLICT)
        }

        const channel: Channel = new Channel()
        channel.type = 'public'
        channel.display_name = name;

        if (typeof password === 'string' && password.length >= 0) {
            channel.password_hash = await bcrypt.hash(password, 10);
        }

        channel.owner = owner;
        channel.users = [owner];

        await this.channelRepository.save(channel)
        return channel;
    }

    private async createPrivate(owner: User, name: string): Promise<Channel> {
        if (typeof name !== 'string' || name.length < 3) {
            throw new HttpException("", HttpStatus.BAD_REQUEST)
        }

        if (await this.channelExist(name)) {
            throw new HttpException("", HttpStatus.CONFLICT)
        }

        const channel: Channel = new Channel();
        channel.type = 'private';
        channel.display_name = name;
        channel.owner = owner;
        channel.users = [owner];

        await this.channelRepository.save(channel);
        return channel;
    }

    private async getChannel(id: number, withUsers: boolean = false): Promise<Channel> {
        const channel: Channel = await this.channelRepository.findOne({
            where: {
                id: id
            },
            relations: {
                owner: withUsers,
                admins: withUsers,
                users: withUsers
            }
        });
        if (!channel) {
            throw new HttpException("Channel does not exist", HttpStatus.NOT_FOUND);
        }
        return channel;
    }

    async channelExist(name: string): Promise<boolean> {
        const channel: Channel = await this.channelRepository.findOne({
            where: {
                display_name: name
            }
        })
        return (channel) ? true : false; 
    }

    async dmExist(users: User[]): Promise<boolean> {
        if (users.length != 2) {
            throw new HttpException("channel.dmExist: Invalid users count", HttpStatus.BAD_REQUEST);
        }

        const user1Id = users[0].id;
        const user2Id = users[1].id;

        let channel: Channel = await this.channelRepository.createQueryBuilder('channel')
            .innerJoin('channel.users', 'user1', 'user1.id = :user1Id', { user1Id })
            .innerJoin('channel.users', 'user2', 'user2.id = :user2Id', { user2Id })
            .where('channel.type = :type', { type: "dm" })
            .getOne()
        return (channel) ? true : false;
    }
}