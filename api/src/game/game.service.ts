import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GameGateway } from 'src/socket/game.gateway';

import { Game } from './game.entity';
import { User } from 'src/user/user.entity';

import { UserService } from 'src/user/user.service';

interface GameScreen {
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
    x: number;
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
    screen: GameScreen;
}

@Injectable()
export class GameService {
    constructor(
        @InjectRepository(Game)
        private GameRepository: Repository<Game>,
        private gameGateway: GameGateway,
        private userService: UserService,
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
        this.GameRepository.save(game);
        return (game);
    }

    GameMap: Map<PlayerId, Data>;
    private screen: GameScreen = {width: 800, height: 600};

    async PongGame(player1: number, player2: number) {
        let gameData: Data
        gameData.screen = this.screen;
        this.initBall(gameData);
        this.initPaddles(gameData);

        this.GameMap.set(gameData.playerId, gameData);
        await this.gameGateway.sendData(gameData);
        await this.gameGateway.synchronizePlayer(gameData);
        while (1)
        {
            gameData.ball.x = gameData.ball.x + Math.cos(gameData.ball.vectorRadians) * gameData.ball.speed;
            gameData.ball.y = gameData.ball.y + Math.sin(gameData.ball.vectorRadians) * gameData.ball.speed;
            if (gameData.ball.x - gameData.ball.radius < 0)
            {
                this.updateScore(gameData, gameData.playerId.player2Id);
                this.resetBoard(gameData);
            }
            else if (gameData.ball.x + gameData.ball.radius > this.screen.width)
            {
                this.updateScore(gameData, gameData.playerId.player1Id);
                this.resetBoard(gameData);
            }
            else if (gameData.ball.y - gameData.ball.radius <= 0 || gameData.ball.y + gameData.ball.radius >= this.screen.height)
            {
                gameData.ball.vectorRadians = Math.PI * 2 - gameData.ball.vectorRadians + 180;
                this.gameGateway.sendBallData(gameData);
            }
            else if (gameData.ball.x - gameData.ball.radius <= gameData.paddle2.x + gameData.paddle2.width / 2 && gameData.ball.y > gameData.paddle2.y - gameData.paddle2.height / 2 && gameData.ball.y < gameData.paddle2.y + gameData.paddle2.height / 2)
            {
                gameData.ball.vectorRadians = Math.PI * 2 - gameData.ball.vectorRadians + 180;
                gameData.ball.speed = gameData.ball.speed * 1.1;
                this.gameGateway.sendBallData(gameData);
            }
            else if (gameData.ball.x + gameData.ball.radius >= gameData.paddle1.x - gameData.paddle1.width / 2 && gameData.ball.y > gameData.paddle1.y - gameData.paddle1.height / 2 && gameData.ball.y < gameData.paddle1.y + gameData.paddle1.height / 2)
            {
                gameData.ball.vectorRadians = Math.PI * 2 - gameData.ball.vectorRadians + 180;
                gameData.ball.speed = gameData.ball.speed * 1.1;
                this.gameGateway.sendBallData(gameData);
            }
        }
    }

    private async resetBoard(gameData: Data) {
        this.initBall(gameData);
        this.initPaddles(gameData);
        this.gameGateway.sendData(gameData);
    }

    private async initBall(gameData: Data) {
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

    private async initPaddles(gameData: Data) {
        gameData.paddle1.y = this.screen.height / 2;
        gameData.paddle1.x = this.screen.width - 20;
        gameData.paddle1.width = 20;
        gameData.paddle1.height = 100;
        gameData.paddle2.y = this.screen.height / 2;
        gameData.paddle2.x = 20;
        gameData.paddle2.width = 20;
        gameData.paddle2.height = 100;
    }

    private async updateScore(gameData: Data, playerId: number, player1Disconnect: boolean = false, player2Disconnect: boolean = false) {
        if (playerId === gameData.playerId.player1Id)
            gameData.score.player1Score++;
        if (playerId === gameData.playerId.player2Id)
            gameData.score.player2Score++;
        const player1: User = await this.userService.getUser(gameData.playerId.player1Id);
        const player2: User = await this.userService.getUser(gameData.playerId.player2Id);
        if (gameData.score.player1Score >= 10 || player2Disconnect)
        {
            player1.game.games.push();
            player2.game.games.push();
            player1.game.games[player1.game.games.length - 1].score.myScore = gameData.score.player1Score;
            player1.game.games[player1.game.games.length - 1].score.friendScore = gameData.score.player2Score;
            player2.game.games[player2.game.games.length - 1].score.myScore = gameData.score.player2Score;
            player2.game.games[player2.game.games.length - 1].score.friendScore = gameData.score.player1Score;
            player1.game.games[player1.game.games.length - 1].win = true;
            player2.game.games[player2.game.games.length - 1].win = false;
            player1.game.games[player1.game.games.length - 1].friend = player2;
            player2.game.games[player2.game.games.length - 1].friend = player1;
            player1.game.Wins++;
            player2.game.Losses++;
            this.GameMap.delete(gameData.playerId);
            this.gameGateway.endGame(player1.id, player2.id);
            return;
        }
        else if (gameData.score.player2Score >= 10 || player1Disconnect)
        {
            player1.game.games.push();
            player2.game.games.push();
            player1.game.games[player1.game.games.length - 1].score.myScore = gameData.score.player1Score;
            player1.game.games[player1.game.games.length - 1].score.friendScore = gameData.score.player2Score;
            player2.game.games[player2.game.games.length - 1].score.myScore = gameData.score.player2Score;
            player2.game.games[player2.game.games.length - 1].score.friendScore = gameData.score.player1Score;
            player1.game.games[player1.game.games.length - 1].win = false;
            player2.game.games[player2.game.games.length - 1].win = true;
            player1.game.games[player1.game.games.length - 1].friend = player2;
            player2.game.games[player2.game.games.length - 1].friend = player1;
            player1.game.Losses++;
            player2.game.Wins++;
            this.GameMap.delete(gameData.playerId);
            this.gameGateway.endGame(player2.id, player1.id);
            return;
        }
        this.gameGateway.sendScoreData(gameData);
    }

    async updatePadPosition(playerId: number, position: number)
    {
        let gameData: Data = this.find(playerId);
        if (gameData.playerId.player1Id === playerId)
        {
            gameData.paddle1.y = position;
            this.gameGateway.sendPadPosition(gameData.playerId.player2Id, position, gameData.screen);
        }
        else
        {
            gameData.paddle2.y = position;
            this.gameGateway.sendPadPosition(gameData.playerId.player1Id, position, gameData.screen);
        }
    }

    async playerDisconnect(playerId: number)
    {
        let gameData: Data = this.find(playerId);
        if (gameData.playerId.player1Id === playerId)
        {
            this.updateScore(gameData, playerId, true);
            this.gameGateway.endGame(gameData.playerId.player2Id, playerId, true);
        }
        else
        {
            this.updateScore(gameData, playerId, false, true);
            this.gameGateway.endGame(gameData.playerId.player2Id, playerId, true);
        }
        this.GameMap.delete(gameData.playerId);

    }
}