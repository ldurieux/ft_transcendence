import { HttpException, HttpStatus, Controller, Get, Post, Delete, Patch, Body, Request, UseGuards } from '@nestjs/common';

import { AuthGuard } from 'src/auth/auth.guard';

import { ChannelService } from './channel.service';
import { UserService } from 'src/user/user.service';

import { User } from 'src/user/user.entity';

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

        const { id } = req.body;
        if (typeof id === 'number') {
            return this.channelService.getChannelInfo(user, id);
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
    @Get('public')
    async getPublicChannels() {
        return this.channelService.listPublic();
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
}
