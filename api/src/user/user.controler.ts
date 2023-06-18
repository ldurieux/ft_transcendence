import { HttpException, HttpStatus, Controller, Get, Post, Body, Request, UseGuards, UploadedFile, UseInterceptors, ParseFilePipe, FileTypeValidator, MaxFileSizeValidator } from '@nestjs/common';
import * as jimp from 'jimp';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { User } from './user.entity';

import { AuthGuard } from 'src/auth/auth.guard';
import { TwoFaGuard } from 'src/auth/twofa.guard';
import { View } from 'typeorm/schema-builder/view/View';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UseGuards(AuthGuard)
    @Get()
    async getUser(@Request() req) {
        const { id, username } = req.query

        if (typeof username === 'string') {
            return await this.userService.getUserByUsername(username);
        }

        if (typeof id !== 'string') {
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        }

        const val: number = parseInt(id);
        if (isNaN(val)) {
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        }

        const user: User = await this.userService.getUser(val, false, true);
        return user;
    }

    @UseGuards(AuthGuard)
    @Get('self')
    async getSelf(@Request() req) {
        const id = req['user'];

        const user: User = await this.userService.getUser(id, true, true);
        user.auths.forEach( (e) => {
            delete e.data;
        })

        let receivedRequests = [];
        for (req of user.receivedRequests) {
            receivedRequests.push(await this.userService.getFriendRequestUser(user, req.id));
        }
        let sentRequests = [];
        for (req of user.sentRequests) {
            sentRequests.push(await this.userService.getFriendRequestUser(user, req.id));
        }

        let res: Object = user;
        delete res["receivedRequests"];
        delete res["sentRequests"];
        res["receivedRequests"] = receivedRequests;
        res["sentRequests"] = sentRequests;

        return res;
    }

    @UseGuards(AuthGuard)
    @Get('block')
    async blockUser(@Request() req) {
        const self: User = await this.userService.getUser(req['user'], true);
        const { id } = req.query;

        if (typeof id !== 'string') {
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        }
        const val: number = parseInt(id);
        if (isNaN(val)) {
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        }

        const user: User = await this.userService.getUser(val, true);
        await this.userService.blockUser(self, user);
        return { status: "blocked" };
    }

    @UseGuards(AuthGuard)
    @Get('unblock')
    async unblockUser(@Request() req) {
        const self: User = await this.userService.getUser(req['user'], true);
        const { id } = req.query;

        if (typeof id !== 'string') {
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        }
        const val: number = parseInt(id);
        if (isNaN(val)) {
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        }

        const user: User = await this.userService.getUser(val);
        await this.userService.unblockUser(self, user);
        return { status: "unblocked" };
    }

    @UseGuards(AuthGuard)
    @Get('leaderboard')
    async getLeaderboard() {
        return this.userService.leaderboard();
    }

    @UseGuards(AuthGuard)
    @Post('username')
    async setUsername(@Request() req) {
        const id = req['user'];
        const { username } = req.body

        if (typeof username !== 'string' || username.length < 3 || username.length > 12) {
            throw new HttpException("", HttpStatus.BAD_REQUEST)
        }

        await this.userService.setUsername(id, username);
        return { status: "modified" };
    }

    @UseGuards(AuthGuard)
    @Post('picture')
    @UseInterceptors(FileInterceptor('image'))
    async setPicture(@Request() req, @UploadedFile(
        new ParseFilePipe({
            validators: [
              new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
              new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
            ],
        }),
    ) file)
    {
        const id = req['user'];

        if (typeof file !== 'object') {
            throw new HttpException("test", HttpStatus.BAD_REQUEST)
        }

        const image = await jimp.read(file.buffer);
        let res;
        if (image) {
            res = await image.getBase64Async(jimp.AUTO);
            this.userService.setPicture(id, res)
        }
        else {
            throw new HttpException("Invalid image", HttpStatus.BAD_REQUEST)
        }

        return { status: "modified", profile_picture: res }
    }

    @Post('register')
    async register(@Body() data: { method: string }) {
        const { method } = data;

        if (typeof method !== 'string') {
            throw new HttpException("", HttpStatus.BAD_REQUEST)
        }

        const { token } = await this.userService.register(method, data)
        return { access_token: token };
    }

    @Post('login')
    async login(@Body() data: { method: string }) {
        const { method } = data;

        if (typeof method !== 'string') {
            throw new HttpException("", HttpStatus.BAD_REQUEST)
        }

        const { token, twoFaEnabled } = await this.userService.login(method, data);
        return { access_token: token, twoFaEnabled: twoFaEnabled };
    }

    @UseGuards(TwoFaGuard)
    @Post('login2fa')
    async login2fa(@Request() req) {
        const { code } = req.body;
        const id: number = req['user'];

        if (typeof code !== 'string') {
            throw new HttpException("", HttpStatus.BAD_REQUEST)
        }

        const token = await this.userService.login2fa(id, code);
        return { access_token: token };
    }

    @UseGuards(AuthGuard)
    @Post('enable2fa')
    async enable2fa(@Request() req)
    {
        const { code } = req.body;
        const id: number = req['user'];

        if (typeof code !== 'string') {
            throw new HttpException("", HttpStatus.BAD_REQUEST)
        }

        await this.userService.login2fa(id, code, true);
    }

    @UseGuards(AuthGuard)
    @Post('disable2fa')
    async disable2fa(@Request() req)
    {
        const id: number = req['user'];

        await this.userService.disable2fa(id);
    }

    @UseGuards(AuthGuard)
    @Post('generate2fa')
    async generate2fa(@Request() req)
    {
        const id: number = req['user'];

        return { qrcode: await this.userService.generate2fa(id) };
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
}
