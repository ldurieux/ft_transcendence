import { HttpException, HttpStatus, Controller, Get, Post, Delete, Patch, Body, Headers, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    async getUser(@Body() body: { id: number }, @Headers('authorization') authHeader: string) {
        const { id } = body;

        if (typeof id !== 'number') {
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        }
        this.userService.checkAuth(authHeader);

        const user = await this.userService.getUser(id);
        return {
            id: user.id,
            username: user.username,
            profile_picture: user.profile_picture,
            elo: user.elo,
        }
    }

    @Post()
    createUser(@Body() user: { username: string; password: string }) {
        const { username, password } = user;

        if (typeof username !== 'string' || typeof password !== 'string') {
            throw new HttpException("", HttpStatus.BAD_REQUEST)
        }
        
        return this.userService.registerPassword(username, password);
    }

    @Get('self')
    async getSelf(@Headers('authorization') authHeader: string) {
        const id = await this.userService.checkAuth(authHeader);

        return this.userService.getUser(id);
    }

    @Delete('self')
    async deleteSelf(@Headers('authorization') authHeader: string) {
        const id = await this.userService.checkAuth(authHeader);

        return this.userService.deleteUser(id);
    }

    @Patch('self')
    async patchSelf(@Body() body: { password: string, profile_picture: string }, @Headers('authorization') authHeader: string) {
        const id = await this.userService.checkAuth(authHeader);
        const { password, profile_picture } = body;

        return this.userService.updateUser(id, password, profile_picture);
    }

    @Get('login')
    login(@Body() user: { username: string, password: string }) {
        const { username, password } = user;

        if (typeof username !== 'string' || typeof password !== 'string') {
            throw new HttpException("", HttpStatus.BAD_REQUEST)
        }

        return this.userService.loginPassword(username, password)
    }
}
