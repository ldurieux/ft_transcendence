import { HttpException, HttpStatus, Controller, Get, Post, Delete, Patch, Body, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

import { AuthGuard } from 'src/auth/auth.guard';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UseGuards(AuthGuard)
    @Get()
    async getUser(@Body() body: { id: number }) {
        const { id } = body;

        if (typeof id !== 'number') {
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        }

        const user = await this.userService.getUser(id);
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

    @Post()
    async register(@Body() data: { method: string }) {
        const { method } = data;

        if (typeof method !== 'string') {
            throw new HttpException("", HttpStatus.BAD_REQUEST)
        }

        const token: string = await this.userService.register(method, data)
        return { access_token: token };
    }

    @Get('login')
    async login(@Body() data: { method: string }) {
        const { method } = data;

        if (typeof method !== 'string') {
            throw new HttpException("", HttpStatus.BAD_REQUEST)
        }

        const token: string = await this.userService.login('local', data);
        return { access_token: token };
    }
}
