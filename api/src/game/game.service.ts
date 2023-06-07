import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './game.entity';
import { User } from '../user/user.entity';

@Injectable()
export class GameService {
    constructor(
        @InjectRepository(Game)
        private gameRepository: Repository<Game>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}
    
    async createGame(user: User) {
        const game = new Game();
        game.win = 0;
        game.lose = 0;
        return this.gameRepository.save(game);
    }
    
    async updateGame(user: User, win: boolean) {
        const game = await this.gameRepository.findOne({ where: { user: user } });
        if (win) {
        game.win += 1;
        } else {
        game.lose += 1;
        }
        return this.gameRepository.save(game);
    }
    
    async getGame(user: User) {
        return this.gameRepository.findOne({ where: { user: user } });
    }
}