import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Game } from './game.entity';
import { User } from 'src/user/user.entity';

@Injectable()
export class GameService {
    constructor(
        @InjectRepository(Game)
        private gameRepository: Repository<Game>,
    ) {}
    
    async createemptyGame(user: User): Promise<Game> {
        if (user.game) {
            return user.game;
        }
        const game: Game = new Game();
        return (game);
    }

    async getGame(id: any): Promise<Game> {
        return this.gameRepository.findOne(id);
    }

}