import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcryptjs';

import { Channel } from './channel.entity';

import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { Message } from 'src/message/message.entity';
import { MessageService } from 'src/message/message.service';
import { ActionService } from 'src/action/action.service';

import { ChatGateway } from 'src/socket/chat.gateway';

@Injectable()
export class ChannelService {
    constructor(
        @InjectRepository(Channel)
        private channelRepository: Repository<Channel>,
        private readonly userService: UserService,
        private readonly messageService: MessageService,
        private readonly actionService: ActionService,
        private readonly websocket: ChatGateway
    ) {}

    async listPublic() {
        const channels: Channel[] = await this.channelRepository.find({
            where: {
                type: 'public'
            },
            select: {
                id: true,
                display_name: true,
            },
            relations: {
                users: true,
            }
        });
        return channels;
    }

    async listSelfChannel(user: User) {
        let channels: Channel[] = await this.channelRepository.createQueryBuilder('channel')
            .leftJoinAndSelect('channel.users', 'user')
            .where('user.id = :userId', { userId: user.id })
            .select(['channel.id', 'channel.display_name', 'channel.type'])
            .getMany();

        for (let i = 0; i < channels.length; i++) {
            let channel: Channel = channels[i]

            if (channel.type != "dm")
                continue

            channel = await this.channelRepository.findOne({
                where: {
                    id: channel.id
                },
                relations: {
                    users: true
                }
            })

            if (channel.users[0].id == user.id)
                channels[i].display_name = channel.users[1].display_name
            else
                channels[i].display_name = channel.users[0].display_name
        }

        return channels;
    }

    async getChannelInfo(user: User, channelId: number) {
        const channel: Channel = await this.getChannel(channelId, true);
        
        if (!channel.users.some(e => e.id == user.id)) {
            throw new HttpException("User not in channel", HttpStatus.FORBIDDEN);
        }

        if (channel.type == "dm") {
            if (channel.users[0].id == user.id)
                channel.display_name = channel.users[1].display_name
            else
                channel.display_name = channel.users[0].display_name
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

        if (await this.actionService.isBanned(self, channel))
            throw new HttpException("Banned", HttpStatus.FORBIDDEN)

        channel.users.push(self);

        for (const to of channel.users) {
            this.websocket.sendTo(to.id, { event: "join", data: { channel: channel.id, user: self } })
        }

        return this.channelRepository.save(channel);
    }

    async addUser(from: User, user: User, channelId: number) {
        const channel: Channel = await this.getChannel(channelId, true);

        if (!channel.users.some(e => e.id == from.id)) {
            throw new HttpException("Inviter not in channel", HttpStatus.FORBIDDEN);
        }
        if (channel.users.some(e => e.id == user.id)) {
            throw new HttpException("User already in channel", HttpStatus.CONFLICT)
        }
        if (this.userService.isBlocked(from, user.id) || this.userService.isBlocked(user, from.id)) {
            throw new HttpException("User is blocked", HttpStatus.FORBIDDEN);
        }
        if (await this.actionService.isBanned(user, channel))
            throw new HttpException("User is banned", HttpStatus.FORBIDDEN)

        channel.users.push(user);

        for (const to of channel.users) {
            this.websocket.sendTo(to.id, { event: "join", data: { channel: channel.id, user: user } })
        }

        await this.channelRepository.save(channel);
    }

    async kickUser(from: User, user: User, channelId: number) {
        const channel: Channel = await this.getChannel(channelId, true);

        this.canEditUser(from, user, channel);

        channel.users = channel.users.filter(e => e.id != user.id)
        channel.admins = channel.admins.filter(e => e.id != user.id)
        await this.channelRepository.save(channel);

        this.websocket.sendTo(user.id, { event: "leave", data: { channel: channel.id, user: user.id } })

        for (const to of channel.users) {
            this.websocket.sendTo(to.id, { event: "leave", data: { channel: channel.id, user: user.id } })
        }
    }

    async banUser(from: User, user: User, channelId: number, duration: number) {
        const channel: Channel = await this.getChannel(channelId, true);

        if (await this.actionService.isBanned(user, channel))
            throw new HttpException("User already banned", HttpStatus.CONFLICT)

        await this.kickUser(from, user, channelId);

        await this.actionService.addBan(user, channel, duration);
    }

    async muteUser(from: User, user: User, channelId: number, duration: number) {
        const channel: Channel = await this.getChannel(channelId, true);

        this.canEditUser(from, user, channel);

        if (await this.actionService.isMuted(user, channel))
            throw new HttpException("User already muted", HttpStatus.CONFLICT)

        await this.actionService.addMute(user, channel, duration);
    }

    async promoteUser(from: User, user: User, channelId: number) {
        const channel: Channel = await this.getChannel(channelId, true);

        const isAdmin: boolean = this.canEditUser(from, user, channel);

        if (isAdmin) {
            channel.owner = user;
            channel.admins = channel.admins.filter(e => e.id != user.id)
        }
        else {
            channel.admins.push(user);
        }
        await this.channelRepository.save(channel);
    }

    async demoteUser(from: User, user: User, channelId: number) {
        const channel: Channel = await this.getChannel(channelId, true);

        const isAdmin: boolean = this.canEditUser(from, user, channel);

        if (!isAdmin) {
            throw new HttpException("This use cannot be demoted", HttpStatus.BAD_REQUEST);
        }

        channel.admins = channel.admins.filter(e => e.id != user.id)
        await this.channelRepository.save(channel);
    }

    canEditUser(from: User, user: User, channel: Channel): boolean {
        if (from.id == user.id) {
            throw new HttpException("Cannot use on yourself", HttpStatus.BAD_REQUEST);
        }
        if (channel.owner.id == user.id) {
            throw new HttpException("Cannot use on the owner", HttpStatus.FORBIDDEN);
        }
        if (!channel.users.some(e => e.id == user.id)) {
            throw new HttpException("User not in channel", HttpStatus.NOT_FOUND);
        }
        if (channel.owner.id != from.id && !channel.admins.some(e => e.id == from.id)) {
            throw new HttpException("Insufficient permissions", HttpStatus.FORBIDDEN);
        }
        const isAdmin: boolean = channel.admins.some(e => e.id == user.id);
        if (isAdmin && channel.owner.id != from.id) {
            throw new HttpException("Insufficient permissions", HttpStatus.FORBIDDEN);
        }
        return isAdmin;
    }

    async leaveChannel(self: User, channelId: number) {
        const channel: Channel = await this.getChannel(channelId, true);

        if (!channel.users.some(e => e.id == self.id)) {
            throw new HttpException("User not in channel", HttpStatus.NOT_FOUND)
        }

        for (const to of channel.users) {
            this.websocket.sendTo(to.id, { event: "leave", data: { channel: channel.id, user: self.id } })
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
        const channel: Channel = await this.getChannel(channelId, true);

        for (const to of channel.users) {
            this.websocket.sendTo(to.id, { event: "delete", data: { channel: channel.id } })
        }

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

        for (const to of channel.users) {
            this.websocket.sendTo(to.id, { event: "join", data: { channel: channel.id, user: self.id } })
            this.websocket.sendTo(to.id, { event: "join", data: { channel: channel.id, user: other.id } })
        }

        await this.channelRepository.save(channel)
        return channel;
    }

    private async createPublic(owner: User, name: string, password: string): Promise<Channel> {
        if (typeof name !== 'string' || name.length < 3) {
            throw new HttpException("", HttpStatus.BAD_REQUEST)
        }

        if (await this.channelExist(name)) {
            throw new HttpException("ChatMain already exist", HttpStatus.CONFLICT)
        }

        const channel: Channel = new Channel()
        channel.type = 'public'
        channel.display_name = name;

        if (typeof password === 'string' && password.length > 0) {
            channel.password_hash = await bcrypt.hash(password, 10);
        }

        channel.owner = owner;
        channel.users = [owner];

        await this.channelRepository.save(channel)

        for (const to of channel.users) {
            this.websocket.sendTo(to.id, { event: "join", data: { channel: channel.id, user: owner.id } })
        }

        return channel;
    }

    private async createPrivate(owner: User, name: string): Promise<Channel> {
        if (typeof name !== 'string' || name.length < 3) {
            throw new HttpException("", HttpStatus.BAD_REQUEST)
        }

        if (await this.channelExist(name)) {
            throw new HttpException("ChatMain already exist", HttpStatus.CONFLICT)
        }

        const channel: Channel = new Channel();
        channel.type = 'private';
        channel.display_name = name;
        channel.owner = owner;
        channel.users = [owner];

        await this.channelRepository.save(channel);

        for (const to of channel.users) {
            this.websocket.sendTo(to.id, { event: "join", data: { channel: channel.id, user: owner.id } })
        }

        return channel;
    }

    async updatePassword(user: User, channelId: number, password: string | null) {
        let channel: Channel = await this.getChannel(channelId, true);

        if (channel.type != "public") {
            throw new HttpException("Only public channels can have a password", HttpStatus.BAD_REQUEST);
        }
        if (channel.owner.id != user.id) {
            throw new HttpException("Only the owner can change password", HttpStatus.FORBIDDEN);
        }

        if (typeof password === 'string' && password.length > 0) {
            channel.password_hash = await bcrypt.hash(password, 10);
        }
        else {
            channel.password_hash = null;
        }

        await this.channelRepository.save(channel);
    }

    private async getChannel(id: number, withUsers: boolean = false, withMessages: boolean = false): Promise<Channel> {
        const channel: Channel = await this.channelRepository.findOne({
            where: {
                id: id
            },
            relations: {
                owner: withUsers,
                admins: withUsers,
                users: withUsers,
                messages: withMessages,
            }
        });
        if (!channel) {
            throw new HttpException("ChatMain does not exist", HttpStatus.NOT_FOUND);
        }

        if (withUsers)
        {
            for (let i = 0; i < channel.users.length; i++) {
                if (this.websocket.isOnline(channel.users[i].id) == true)
                    channel.users[i]["status"] = "online";
                else
                    channel.users[i]["status"] = "offline";
            }
            for (let i = 0; i < channel.admins.length; i++) {
                if (this.websocket.isOnline(channel.admins[i].id) == true)
                    channel.admins[i]["status"] = "online";
                else
                    channel.admins[i]["status"] = "offline";
            }
            if (this.websocket.isOnline(channel.owner.id) == true)
                channel.owner["status"] = "online";
            else
                channel.owner["status"] = "offline";
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

    async sendMessage(user: User, channelId: number, text: string): Promise<Message> {
        const channel: Channel = await this.getChannel(channelId, true);

        if (await this.actionService.isMuted(user, channel))
            throw new HttpException("Muted", HttpStatus.FORBIDDEN)

        if (channel.users.some(e => e.id == user.id)) {
            for (const to of channel.users) {
                console.log("TEXT" + text);
                this.websocket.sendTo(to.id, { event: "message", data: { channel: channel.id, owner: user, text: text } })
            }

            delete channel.users;
            delete channel.password_hash;
            delete channel.admins;
            delete channel.owner;

            return this.messageService.addMessage(user, channel, text);
        }

        throw new HttpException("user not in channel", HttpStatus.FORBIDDEN);
    }

    async getMessages(user: User, channelId: number): Promise<Message[]> {
        const channel: Channel = await this.getChannel(channelId, true);

        if (!channel.users.some(e => e.id == user.id)) {
            throw new HttpException("user not in channel", HttpStatus.FORBIDDEN);
        }

        let messages: Message[] = await this.messageService.getMessages(channel);
        return messages.filter(msg => !this.userService.isBlocked(user, msg.owner.id));
    }
}