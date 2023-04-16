import { HttpException, HttpStatus, Controller, Get, Post, Delete, Body, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('all')
    getAll() {
        return this.userService.findAll();
    }

    @Post('register')
    async postRegister(@Body() user: { name: string; email: string }): Promise<User> {
        const { name, email } = user;

        if (typeof name !== 'string' || typeof email !== 'string') {
            throw new BadRequestException(user)
        }
        
        return this.userService.create(name, email);
    }

    @Delete('delete')
    async deleteUser() {
        return this.userService.deleteOne(2);
    }
}
