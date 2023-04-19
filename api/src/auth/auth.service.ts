import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import { Auth } from './auth.entity'
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Auth)
        private authRepository: Repository<Auth>
    ) {}

    async loginLocal(username: string, password: string) {
        const auth: Auth = await this.authRepository.findOne({
            where: {
                username: username,
                method: 'local'
            },
            relations: {
                user: true,
            }
        });
        if (!auth) {
            throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);
        }

        const valid = await bcrypt.compare(password, auth.data['hash']);
        if (!valid) {
            throw new HttpException("Invalid password", HttpStatus.UNAUTHORIZED);
        }

        return auth.user;
    }

    async registerLocal(user: User, password: string): Promise<any> {
        const other: Auth = await this.authRepository.findOne({
            where: {
                username: user.display_name,
                method: 'local'
            }
        });
        if (other) {
            throw new HttpException("Method already exist", HttpStatus.CONFLICT);
        }

        const hash: string = await bcrypt.hash(password, 10);

        const auth = new Auth;
        auth.method = 'local'
        auth.username = user.display_name;

        auth.data = new Map<string, string>
        auth.data['hash'] = hash;
        auth.user = user;

        user.auths.push(auth);

        await this.authRepository.save(auth);
        return user;
    }

    getJwt(user: User) {
        return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    }
}
