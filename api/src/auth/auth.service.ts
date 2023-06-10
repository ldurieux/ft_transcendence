import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import axios, { AxiosError } from 'axios';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

import { Auth } from './auth.entity';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Auth)
        private authRepository: Repository<Auth>
    ) {}

    async getUsername(method: string, data) : Promise<string> {
        switch(method) {
            case '42': {
                const { code } = data;
                return this.getUsername42(code);
            }
            default: {
                throw new HttpException("Unknown method", HttpStatus.METHOD_NOT_ALLOWED);
            }
        }
    }

    async exist(method: string, username: string) : Promise<boolean> {
        const auth: Auth = await this.authRepository.findOne({
            where: {
                username: username,
                method: method
            }
        });
        if (auth) return true;
        return false;
    }

    async loginLocal(username: string, password: string): Promise<User> {
        if (!username || !password) {
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        }

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

    async login42(username: string): Promise<User> {
        const auth: Auth = await this.authRepository.findOne({
            where: {
                username: username,
                method: '42'
            },
            relations: {
                user: true,
            }
        });
        if (!auth) {
            throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);
        }
        return auth.user;
    }

    async registerLocal(user: User, username: string, password: string): Promise<Auth> {
        if (typeof password !== 'string') {
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        }

        const other: Auth = await this.authRepository.findOne({
            where: {
                username: username,
                method: 'local'
            }
        });
        if (other) {
            throw new HttpException("Method already exist", HttpStatus.CONFLICT);
        }
        
        const hash: string = await bcrypt.hash(password, 10);
        
        const auth = new Auth;
        auth.method = 'local'
        auth.username = username;
        
        auth.data = new Map<string, string>
        auth.data['hash'] = hash;
        auth.user = user;

        await this.authRepository.save(auth);
        return auth;
    }

    async register42(user: User, username: string): Promise<Auth> {
        const auth = new Auth;
        auth.method = '42'
        auth.username = username;
        auth.user = user;

        await this.authRepository.save(auth);
        console.log("AUTH" + JSON.stringify(auth));
        return auth;
    }

    getJwt(user: User): string {
        let newvar: string;
        newvar = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        return newvar;
    }

    private async getUsername42(code: string): Promise<string> {
        if (typeof code !== 'string') {
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        }

        const data = {
            code,
            client_id: '' + process.env.INTRA_ID,
            client_secret: '' + process.env.INTRA_SECRET,
            grant_type: 'authorization_code',
            redirect_uri: `http://${process.env.WEB_HOST}:${process.env.FRONT_PORT}/login`
        };

        let reqToken;
        try {
            reqToken = await axios.post(
                'https://api.intra.42.fr/oauth/token',
                data,
            );
        } catch (error) {
            throw new HttpException("42 returned an error", HttpStatus.UNAUTHORIZED);
        }

        if (reqToken.status !== 200) {
            throw new HttpException("", HttpStatus.FAILED_DEPENDENCY);
        }
        if (reqToken?.data?.access_token === undefined) {
            throw new HttpException("", HttpStatus.FAILED_DEPENDENCY);
        }

        let info;
        try {
            info = await axios.get('https://api.intra.42.fr/v2/me', {
                headers: { Authorization: `Bearer ${reqToken.data.access_token}` },
            });
        } catch (error) {
            throw new HttpException("", HttpStatus.FAILED_DEPENDENCY);
        }
        if (info.status !== 200) return;
        if (info?.data?.login === undefined) {
            throw new HttpException("", HttpStatus.FAILED_DEPENDENCY);
        }
        return info.data.login;
    }
}
