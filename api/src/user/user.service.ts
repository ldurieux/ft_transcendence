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

    async getUser(id: number, auths: boolean = false): Promise<User> {
        const user = await this.userRepository.findOne({
            where: {
                id: id
            },
            relations: {
                auths: auths
            }
        })
        if (!user) {
            throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);
        }
        return user;
    }

    async register(method: string, data): Promise<any> {
        const user: User = new User();
        user.auths = new Array<Auth>;

        switch (method) {
            case 'local': {
                user.display_name = data['username'];
                await this.authService.registerLocal(user, data['password'])
                break;
            }
            default: {
                throw new HttpException("Unknown method", HttpStatus.METHOD_NOT_ALLOWED);
            }
        }

        await this.userRepository.save(user);
        return this.authService.getJwt(user);
    }

    async login(method: string, data) {
        let user: User;

        switch (method) {
            case 'local': {
                const { username, password } = data;
                user = await this.authService.loginLocal(username, password);
                break;
            }
        }

        return this.authService.getJwt(user);
    }
}
