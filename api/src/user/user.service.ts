import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    async deleteOne(id: number): Promise<DeleteResult> {
        return this.userRepository.delete(id);
    }

    async create(name: string, email: string): Promise<User> {
        const user = new User();
        user.name = name;
        user.email = email;
        return this.userRepository.save(user);
    }
}
