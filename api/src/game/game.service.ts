import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GameGateway } from 'src/socket/game.gateway';

import { Game } from './game.entity';
import { User } from 'src/user/user.entity';

interface Ball {
    x: number;
    y: number;
    radius: number;
    speed: number;
    vectorRadians: number;
}

interface Paddle {
    y: number;
    width: number;
    height: number;
}

interface Score {
    player1Score: number;
    player2Score: number;
}

interface Data {
    player1Id: number;
    player2Id: number;
    ball: Ball;
    PaddleEnemie: Paddle;
    score: Score;
}

interface Screen {
    width: number;
    height: number;
}

let paddle1: Paddle;

let paddle2: Paddle;

let userId1: number = 0;
let userId2: number = 0;

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

    async PongGame(player1: User, player2: User) {
        userId1 = player1.id;
        userId2 = player2.id;
        const screen: Screen = {
            width: 1000,
            height: 800
        };

        let ball: Ball;
        let score: Score = {
            player1Score: 0,
            player2Score: 0
        };
        this.initBall(ball, screen);
        this.initPaddles(paddle1, paddle2, screen);

        const data: Data = {
            player1Id: 0,
            player2Id: 0,
            ball: ball,
            PaddleEnemie: paddle2,
            score: score
        };

        while (1)
        {
        }
    }

    private initBall(ball: Ball, screen: Screen) {
        ball.x = screen.width / 2;
        ball.y = screen.height / 2;
        ball.radius = 10;
        ball.speed = 5;
        const rad = Math.random() * Math.PI * 2;
        if (rad > Math.PI / 4 && rad < Math.PI * 3 / 4)
            ball.vectorRadians = rad + Math.PI / 2;
        else if (rad > Math.PI * 5 / 4 && rad < Math.PI * 7 / 4)
            ball.vectorRadians = rad + Math.PI / 2;
        else
            ball.vectorRadians = rad;
    }

    private initPaddles(paddle1: Paddle, paddle2: Paddle, screen: Screen) {
        paddle1.y = screen.height / 2;
        paddle1.width = 20;
        paddle1.height = 100;
        paddle2.y = screen.height / 2;
        paddle2.width = 20;
        paddle2.height = 100;
    }

    private updateScore(player1: User, player2: User, score: Score) {
        player1.game.games[player1.game.games.length - 1].score.friendScore++;
        player2.game.games[player2.game.games.length - 1].score.myScore++;
        if (player1.game.games[player1.game.games.length - 1].score.friendScore >= 10)
        {
            player1.game.games[player1.game.games.length - 1].score.myScore = score.player1Score;
            player1.game.games[player1.game.games.length - 1].score.friendScore = score.player2Score;
            player2.game.games[player2.game.games.length - 1].score.myScore = score.player2Score;
            player2.game.games[player2.game.games.length - 1].score.friendScore = score.player1Score;
            player1.game.games[player1.game.games.length - 1].win = true;
            player2.game.games[player2.game.games.length - 1].win = false;
            player1.game.games[player1.game.games.length - 1].friend = player2;
            player2.game.games[player2.game.games.length - 1].friend = player1;
            player1.game.Wins++;
            player2.game.Losses++;
            player1.game.inGame = false;
            player2.game.inGame = false;

        }
        else if (score.player2Score >= 10)
        {
            player1.game.games[player1.game.games.length - 1].score.myScore = score.player1Score;
            player1.game.games[player1.game.games.length - 1].score.friendScore = score.player2Score;
            player2.game.games[player2.game.games.length - 1].score.myScore = score.player2Score;
            player2.game.games[player2.game.games.length - 1].score.friendScore = score.player1Score;
            player1.game.games[player1.game.games.length - 1].win = false;
            player2.game.games[player2.game.games.length - 1].win = true;
            player1.game.games[player1.game.games.length - 1].friend = player2;
            player2.game.games[player2.game.games.length - 1].friend = player1;
            player1.game.Losses++;
            player2.game.Wins++;
            player1.game.inGame = false;
            player2.game.inGame = false;
        }
        this.gameGateway.sendScoreData(player1.id, {myScore: player1.game.games[player1.game.games.length - 1].score.myScore, friendScore: player1.game.games[player1.game.games.length - 1].score.friendScore});
        this.gameGateway.sendScoreData(player2.id, {myScore: player2.game.games[player2.game.games.length - 1].score.myScore, friendScore: player2.game.games[player2.game.games.length - 1].score.friendScore});
    }

    playerDisconnect(player: User) {
        if (player.game.games[player.game.games.length - 1].win == false)
        {
        }
    }
}