import { HttpException, HttpStatus, Controller, Get, Post, Delete, Patch, Body, Request, UseGuards } from '@nestjs/common';

import { AuthGuard } from 'src/auth/auth.guard';

import { ChannelService } from './channel.service';
import { UserService } from 'src/user/user.service';

import { User } from 'src/user/user.entity';
import { Channel } from './channel.entity';

@Controller('channel')
export class ChannelController {
    constructor(
        private readonly channelService: ChannelService,
        private readonly userService: UserService)
    {}

    @UseGuards(AuthGuard)
    @Get()
    async getChannel(@Request() req) {
        const user: User = await this.userService.getUser(req['user']);

        const { id } = req.query;
        if (typeof id === 'string') {
            const val: number = parseInt(id);
            if (isNaN(val)) {
                throw new HttpException("", HttpStatus.BAD_REQUEST);
            }

            return await this.channelService.getChannelInfo(user, val);
        }
        
        return this.channelService.listSelfChannel(user);
    }

    @UseGuards(AuthGuard)
    @Post()
    async createChannel(@Request() req) {
        const id = req['user'];
        
        const user: User = await this.userService.getUser(id);
        
        const { type } = req.body;
        if (typeof type !== 'string' ) {
            throw new HttpException("", HttpStatus.BAD_REQUEST)
        }
        return this.channelService.createChannel(user, type, req.body);
    }

    @UseGuards(AuthGuard)
    @Post("delete")
    async deleteDm(@Request() req) {
        const selfId: number = req['user'];
        const { id } = req.body;

        if (typeof id !== 'number' ) {
            throw new HttpException("", HttpStatus.BAD_REQUEST)
        }
        return this.channelService.deleteDm([ selfId, id ]);
    }

    @UseGuards(AuthGuard)
    @Post('update')
    async updatePassword(@Request() req) {
        const user: User = await this.userService.getUser(req['user']);

        const { id, password } = req.body;
        if (typeof id !== 'number') {
            throw new HttpException("", HttpStatus.BAD_REQUEST)
        }

        await this.channelService.updatePassword(user, id, password);
        return { status: "updated" };
    }

    @UseGuards(AuthGuard)
    @Get('public')
    async getPublicChannels(@Request() req) {
        const id = req['user']

        let channels: Channel[] = await this.channelService.listPublic();

        channels = channels.filter(c => !c.users.some(u => u.id == id))
        channels.forEach(c => delete c.users)

        return channels
    }

    @UseGuards(AuthGuard)
    @Post('join')
    async joinChannel(@Request() req) {
        const user: User = await this.userService.getUser(req['user']);

        const { id } = req.body;
        if (typeof id !== 'number') {
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        }

        await this.channelService.joinChannel(user, id, req.body);
        return { status: "joined" };
    }

    @UseGuards(AuthGuard)
    @Post('leave')
    async leaveChannel(@Request() req) {
        const user: User = await this.userService.getUser(req['user'])

        const { id } = req.body;
        if (typeof id !== 'number') {
            throw new HttpException("", HttpStatus.BAD_REQUEST)
        }

        await this.channelService.leaveChannel(user, id);
        return { status: "left" };
    }

    @UseGuards(AuthGuard)
    @Post('add')
    async addUser(@Request() req) {
        const from: User = await this.userService.getUser(req['user'], true);

        const { username, channelId } = req.body;
        if (typeof username !== 'string' || typeof channelId !== 'number') {
            throw new HttpException("", HttpStatus.BAD_REQUEST)
        }

        const user: User = await this.userService.getUserByUsername(username, true);
        await this.channelService.addUser(from, user, channelId);
        return { status: "added" };
    }

    @UseGuards(AuthGuard)
    @Post('kick')
    async kickUser(@Request() req) {
        const from: User = await this.userService.getUser(req['user']);

        const { userId, channelId } = req.body;
        if (typeof userId !== 'number' || typeof channelId !== 'number') {
            throw new HttpException("", HttpStatus.BAD_REQUEST)
        }

        const user: User = await this.userService.getUser(userId);
        await this.channelService.kickUser(from, user, channelId);
        return { status: "kicked" };
    }

    @UseGuards(AuthGuard)
    @Post('ban')
    async banUser(@Request() req) {
        const from: User = await this.userService.getUser(req['user']);

        const { userId, channelId, duration } = req.body;
        if (typeof userId !== 'number' || typeof channelId !== 'number' || typeof duration !== 'number') {
            throw new HttpException("", HttpStatus.BAD_REQUEST)
        }

        if (duration <= 0) {
            throw new HttpException("", HttpStatus.BAD_REQUEST)
        }

        const user: User = await this.userService.getUser(userId);
        await this.channelService.banUser(from, user, channelId, duration);
        return { status: "banned" };
    }

    @UseGuards(AuthGuard)
    @Post('mute')
    async muteUser(@Request() req) {
        const from: User = await this.userService.getUser(req['user']);

        const { userId, channelId, duration } = req.body;
        if (typeof userId !== 'number' || typeof channelId !== 'number' || typeof duration !== 'number') {
            throw new HttpException("", HttpStatus.BAD_REQUEST)
        }

        if (duration <= 0) {
            throw new HttpException("", HttpStatus.BAD_REQUEST)
        }

        const user: User = await this.userService.getUser(userId);
        await this.channelService.muteUser(from, user, channelId, duration);
        return { status: "muted" };
    }

    @UseGuards(AuthGuard)
    @Post('promote')
    async promoteUser(@Request() req) {
        const from: User = await this.userService.getUser(req['user']);

        const { userId, channelId } = req.body;
        if (typeof userId !== 'number' || typeof channelId !== 'number') {
            throw new HttpException("", HttpStatus.BAD_REQUEST)
        }

        const user: User = await this.userService.getUser(userId);
        await this.channelService.promoteUser(from, user, channelId);
        return { status: "promoted" };
    }

    @UseGuards(AuthGuard)
    @Post('demote')
    async demoteUser(@Request() req) {
        const from: User = await this.userService.getUser(req['user']);

        const { userId, channelId } = req.body;
        if (typeof userId !== 'number' || typeof channelId !== 'number') {
            throw new HttpException("", HttpStatus.BAD_REQUEST)
        }

        const user: User = await this.userService.getUser(userId);
        await this.channelService.demoteUser(from, user, channelId);
        return { status: "demoted" };
    }

    @UseGuards(AuthGuard)
    @Post('message')
    async sendMessage(@Request() req) {
        const user: User = await this.userService.getUser(req['user'])

        const { id, text } = req.body;
        if (typeof id !== 'number' || typeof text !== 'string'
            || text.length < 1 || text.length > 4096) {
            throw new HttpException("", HttpStatus.BAD_REQUEST)
        }

        return await this.channelService.sendMessage(user, id, text);
    }

    @UseGuards(AuthGuard)
    @Get('message')
    async getMessages(@Request() req) {
        const user: User = await this.userService.getUser(req['user'], true)

        const { id } = req.query;
        if (typeof id !== 'string') {
            throw new HttpException("", HttpStatus.BAD_REQUEST)
        }

        const val: number = parseInt(id);
        if (isNaN(val)) {
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        }

        return await this.channelService.getMessages(user, val);
    }
}
