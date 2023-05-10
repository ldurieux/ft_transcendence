import { HttpException, HttpStatus, Controller, Get, Post, Delete, Patch, Body, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

import { AuthGuard } from 'src/auth/auth.guard';
import { View } from 'typeorm/schema-builder/view/View';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UseGuards(AuthGuard)
    @Get()
    async getUser(@Request() req) {
        const { id } = req.query

        if (typeof id !== 'string') {
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        }

        const val: number = parseInt(id);
        if (isNaN(val)) {
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        }

        const user: User = await this.userService.getUser(val);
        return user;
    }

    @UseGuards(AuthGuard)
    @Get('self')
    async getSelf(@Request() req) {
        const id = req['user'];

        const user: User = await this.userService.getUser(id, true);
        user.auths.forEach( (e) => {
            delete e.data;
        })
        return user;
    }

    @UseGuards(AuthGuard)
    @Post('username')
    async setUsername(@Request() req) {
        const id = req['user'];
        const { username } = req.body

        if (typeof username !== 'string' || username.length < 3) {
            throw new HttpException("", HttpStatus.BAD_REQUEST)
        }

        await this.userService.setUsername(id, username);
        return { status: "modified" };
    }

    @Post('register')
    async register(@Body() data: { method: string }) {
        const { method } = data;

        if (typeof method !== 'string') {
            throw new HttpException("", HttpStatus.BAD_REQUEST)
        }

        const token: string = await this.userService.register(method, data)
        return { access_token: token };
    }

    @Post('login')
    async login(@Body() data: { method: string }) {
        const { method } = data;

        if (typeof method !== 'string') {
            throw new HttpException("", HttpStatus.BAD_REQUEST)
        }

        const token: string = await this.userService.login(method, data);
        return { access_token: token };
    }

    @UseGuards(AuthGuard)
    @Post('friend')
    async addFriend(@Request() req) {
        const requesterId: number = req['user'];
        const { id } = req.body;

        if (typeof id !== 'number') {
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        }

        await this.userService.addFriend(requesterId, id);
        return { status: "created" };
    }

    @UseGuards(AuthGuard)
    @Post('friend/reject')
    async rejectFriend(@Request() req) {
        const selfId: number = req['user'];
        const { id } = req.body;

        if (typeof id !== 'number') {
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        }

        await this.userService.rejectFriend(selfId, id);
        return { status: "rejected" };
    }

    @UseGuards(AuthGuard)
    @Post('friend/delete')
    async removeFriend(@Request() req) {
        const selfId: number = req['user'];
        const { id } = req.body;

        if (typeof id !== 'number') {
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        }

        await this.userService.removeFriend(selfId, id);
        return { status: "removed" };
    }

    @Get('debug')
    async debug() {
        return this.userService.debug();
    }
}
