import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GameGateway } from 'src/socket/game.gateway';

import { Game } from './game.entity';
import { User } from 'src/user/user.entity';

interface Screen {
    width: number;
    height: number;
}

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

interface PlayerId {
    player1Id: number;
    player2Id: number;
}

interface Data {
    playerId: PlayerId;
    ball: Ball;
    paddle1: Paddle;
    paddle2: Paddle;
    score: Score;
    screen: Screen;
}

@Injectable()
export class GameService {
    constructor(
        @InjectRepository(Game)
        private gameRepository: Repository<Game>,
        private gameGateway: GameGateway
    ) {}

    find(playerId: number): Data | undefined {
        for (const [key, value] of this.GameMap) {
            if (key.player1Id === playerId || key.player2Id === playerId) {
                return value;
            }
        }
        return undefined;
    }

    createemptyGame(user: User): Game {
        if (user.game) {
            return user.game;
        }
        const game: Game = new Game();
        this.gameRepository.save(game);
        return (game);
    }

    GameMap: Map<PlayerId, Data>;
    private screen: Screen = {width: 800, height: 600};

    async PongGame(player1: User, player2: User) {
        let gameData: Data
        gameData.playerId.player1Id = player1.id;
        gameData.playerId.player2Id = player2.id;
        this.GameMap.set(gameData.playerId, gameData);
        this.initBall(gameData.playerId);

        this.GameMap.set(gameData.playerId, gameData);
        while (1)
        {
        }
    }

    private resetBoard(ball: Ball, paddle1: Paddle, paddle2: Paddle, screen: Screen) {
        this.initBall(ball);
        this.initPaddles(paddle1, paddle2);
    }

    private initBall(playerId: number) {
        let gameData: Data = this.find(playerId);
        gameData.ball.x = screen.width / 2;
        gameData.ball.y = screen.height / 2;
        gameData.ball.radius = 10;
        gameData.ball.speed = 5;
        const rad = Math.random() * Math.PI * 2;
        if (rad > Math.PI / 4 && rad < Math.PI * 3 / 4)
           gameData.ball.vectorRadians = rad + Math.PI / 2;
        else if (rad > Math.PI * 5 / 4 && rad < Math.PI * 7 / 4)
            gameData.ball.vectorRadians = rad + Math.PI / 2;
        else
            gameData.ball.vectorRadians = rad;
    }

    private initPaddles(playerId: number) {
        let gameData: Data = this.find(playerId);
        gameData.paddle1.y = this.screen.height / 2;
        gameData.paddle1.width = 20;
        gameData.paddle1.height = 100;
        gameData.paddle2.y = this.screen.height / 2;
        gameData.paddle2.width = 20;
        gameData.paddle2.height = 100;
    }

    private async updateScore(player1: User, player2: User, score: Score, player1Disconnect: boolean, player2Disconnect: boolean) {
        if (score.player1Score >= 10 || player2Disconnect)
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
            return;
        }
        else if (score.player2Score >= 10 || player1Disconnect)
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
            return;
        }
        this.gameGateway.sendScoreData(player1.id, {myScore: player1.game.games[player1.game.games.length - 1].score.myScore, friendScore: player1.game.games[player1.game.games.length - 1].score.friendScore});
        this.gameGateway.sendScoreData(player2.id, {myScore: player2.game.games[player2.game.games.length - 1].score.myScore, friendScore: player2.game.games[player2.game.games.length - 1].score.friendScore});
    }

    async updatePadPosition(playerId number, position: number)
    {
        let gameData: Data = this.find(playerId);
        if (gameData.playerId.player1Id === playerId)
        {
            gameData.paddle1.y = position;
        }
        else
        {
            gameData.paddle2.y = position;
        }
    }
}