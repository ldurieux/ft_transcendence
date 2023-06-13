import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GameGateway } from 'src/socket/game.gateway';

import { Game } from './game.entity';
import { User } from 'src/user/user.entity';



@Injectable()
export class GameService {
    constructor(
        @InjectRepository(Game)
        private gameRepository: Repository<Game>,
        private gameGateway: GameGateway
    ) {}
    
    createemptyGame(user: User): Game {
        if (user.game) {
            return user.game;
        }
        const game: Game = new Game();
        this.gameRepository.save(game);
        return (game);
    }

    async getGame(id: any): Promise<Game> {
        return this.gameRepository.findOne(id);
    }

    async startPongGame(player1: User, player2: User) {
        const BallRadius = 5;
        const BallSpeed = 5;
        const PaddleWidth = 10;
        const PaddleHeight = 100;
        const screenHeight = 1000;
        const screenWidth = 1000;
        
        player1.game.inGame = true;
        player2.game.inGame = true;
        player1.game.games.push({friend: player2, score: {myScore: 0, friendScore: 0}, win: false});
        player2.game.games.push({friend: player1, score: {myScore: 0, friendScore: 0}, win: false});

        let ballX = screenWidth / 2;
        let ballY = screenHeight / 2;
        let ballRadianVector = 50 % 360 * Math.PI / 180;
        let ballSpeed = BallSpeed;
        let paddle1Y = screenHeight / 2 - PaddleHeight / 2;
        let paddle2Y = screenHeight / 2 - PaddleHeight / 2;
        this.updatePadlePosition(player1, player2, paddle1Y, paddle2Y);
        while (1)
        {
            ballX += ballSpeed * Math.cos(ballRadianVector);
            ballY += ballSpeed * Math.sin(ballRadianVector);
            if (ballX < 0)
            {
                if (ballY > paddle1Y && ballY < paddle1Y + PaddleHeight)
                {
                    ballRadianVector = Math.PI - ballRadianVector;
                    ballSpeed += 0.5;
                    this.gameGateway.sendPongData();
                }
                else
                {
                    this.updateScore(player1, player2);
                }
            }
            if (ballX > screenWidth)
            {
                if (ballY > paddle2Y && ballY < paddle2Y + PaddleHeight)
                {
                    ballRadianVector = Math.PI - ballRadianVector;
                    ballSpeed += 0.5;
                    this.gameGateway.sendPongData(player1, player2, ballX, ballY, ballRadianVector, ballSpeed, paddle1Y, paddle2Y);
                }
                else
                {
                    this.updateScore(player2, player1);
                }
            }
            if (ballY < 0 || ballY > screenHeight)
            {
                ballRadianVector = 2 * Math.PI - ballRadianVector;
                    this.gameGateway.sendPongData(player1, player2, );
            }
        }
        player1.game.inGame = false;
        player2.game.inGame = false;
    }

    updateScore(player1: User, player2: User) {
        player1.game.games[player1.game.games.length - 1].score.friendScore++;
        player2.game.games[player2.game.games.length - 1].score.myScore++;
        if (player1.game.games[player1.game.games.length - 1].score.friendScore >= 10)
        {
            player1.game.games[player1.game.games.length - 1].win = true;
            player2.game.games[player2.game.games.length - 1].win = false;
            player1.game.Wins++;
            player2.game.Losses++;
            player1.game.inGame = false;
            player2.game.inGame = false;

        }
        else if (player2.game.games[player2.game.games.length - 1].score.myScore >= 10)
        {
            player1.game.games[player1.game.games.length - 1].win = false;
            player2.game.games[player2.game.games.length - 1].win = true;
            player1.game.Losses++;
            player2.game.Wins++;
            player1.game.inGame = false;
            player2.game.inGame = false;
        }
    }
}