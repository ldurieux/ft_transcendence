import { Logger, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { User } from './user.entity';

import { Auth } from 'src/auth/auth.entity';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private readonly authService: AuthService
    ) {}

    async getUser(id: number, self: boolean = false): Promise<User> {
        const user = await this.userRepository.findOne({
            where: {
                id: id
            },
            relations: {
                auths: self
            }
        })
        if (!user) {
            throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);
        }
        return user;
    }

    async register(method: string, data): Promise<string> {
        const { username } = data;
        if (typeof username !== 'string') {
            throw new HttpException("", HttpStatus.BAD_REQUEST);
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
        return this.authService.getJwt(user);
    }

    async login(method: string, data) : Promise<string> {
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

        return this.authService.getJwt(user);
    }

    private async loginOrRegister(method: string, data) : Promise<string> {
        let username: string = await this.authService.getUsername(method, data);

        data.username = username;
        if (! await this.authService.exist(method, username)) {
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

        return this.authService.getJwt(user);
    }
}
