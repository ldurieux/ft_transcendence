import { Logger, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async checkAuth(authHeader: any): Promise<number> {
        if (typeof authHeader !== 'string') {
            throw new HttpException("Missing Authorization header", HttpStatus.UNAUTHORIZED);
        }

        const token = authHeader.split(' ')[1]
        if (typeof token !== 'string') {
            throw new HttpException("Invalid Authorization header", HttpStatus.UNAUTHORIZED);
        }

        var data;
        try {
            data = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            throw new HttpException("JWT token invalid", HttpStatus.UNAUTHORIZED);
        }
        
        const { id } = data;
        const count = await this.userRepository.count(id);

        if (count == 0) {
            throw new HttpException("User no longer exist", HttpStatus.GONE);
        }

        return id;
    }

    async getUser(id: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where: {
                id: id
            }
        })
        if (!user) {
            throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);
        }
        return user;
    }

    async deleteUser(id: number) {
        return this.userRepository.delete(id);
    }

    async updateUser(id: number, password: string, profile_picture: string) {
        const user = await this.getUser(id);

        if (typeof password === 'string') {
            user.pass_hash = await bcrypt.hash(password, 10);
        }
        if (typeof profile_picture === 'string') {
            //TODO
            //validate profile picture
            user.profile_picture = profile_picture;
        }

        return this.userRepository.save(user);
    }

    async loginPassword(username: string, password: string): Promise<any> {
        const user = await this.userRepository.findOne({
            where: {
                username: username
            }
        })
        if (!user) {
            throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);
        }

        const valid = await bcrypt.compare(password, user.pass_hash);
        if (!user) {
            throw new HttpException("Invalid password", HttpStatus.UNAUTHORIZED);
        }

        return { token: this.getJwt(user) }
    }

    async registerPassword(username: string, password: string): Promise<any> {
        const other = await this.userRepository.findOne({
            where: {
                username: username
            }
        })
        if (other) {
            throw new HttpException("User already exist", HttpStatus.CONFLICT);
        }

        const hash = await bcrypt.hash(password, 10);

        const user = new User();
        user.username = username;
        user.pass_hash = hash;

        await this.userRepository.save(user);

        return { token: this.getJwt(user) }
    }

    async deleteOne(id: number): Promise<DeleteResult> {
        return this.userRepository.delete(id);
    }

    getJwt(user: User) {
        return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    }
}
