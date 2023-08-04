import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Game } from './game.entity';

import { UserService } from 'src/user/user.service';

import { SocketServer } from 'src/socket/socket.server';

import * as gameInterface from './gameInterface';

import { Deque } from 'double-ended-queue';

import { GameReply } from 'src/socket/game.reply';



@Injectable()
export class GameService {
    constructor(
        private readonly gameRepository: Repository<Game>,
        private readonly userService: UserService,
    ) {}

    // private waitingStack: Deque<gameInterface.WaitingPlayer>;

    // async addWaitingPlayer(game: gameInterface.WaitingPlayer)
    // {
    //     this.waitingStack.push(game);
    // }

    // async deleteWaitingPlayer(game: gameInterface.WaitingPlayer)
    // {
    //     this.waitingStack.removeOne(game);
    // }

    // async getWaitingPlayer(id: number): Promise<gameInterface.WaitingPlayer | undefined>
    // {
    //     for (const game of this.waitingStack)
    //     {
    //         if (game.player1Id === id || game.player2Id === id)
    //             return game;
    //     }
    //     return undefined;
    // }
}

//     find(playerId: number): Data | undefined {
//         for (const [key, value] of this.GameMap) {
//             if (key.player1Id === playerId || key.player2Id === playerId) {
//                 return value;
//             }
//         }
//         return undefined;
//     }

//     GameMap: Map<PlayerId, Data>;
//     private screen: GameScreen = {width: 1000, height: 1000};

//     async PongGame(player1: number, player2: number) {
//         let gameData: Data
//         gameData.screen = this.screen;
//         this.initBall(gameData);
//         this.initPaddles(gameData);
//         gameData.playerId.player1Id = player1;
//         gameData.playerId.player2Id = player2;

//         this.GameMap.set(gameData.playerId, gameData);
//         await this.socketServer.sendData(gameData);
//         await this.socketServer.synchronizePlayer(gameData);
//         while (1)
//         {
//             gameData.ball.x = gameData.ball.x + Math.cos(gameData.ball.vectorRadians) * gameData.ball.speed;
//             gameData.ball.y = gameData.ball.y + Math.sin(gameData.ball.vectorRadians) * gameData.ball.speed;
//             if (gameData.ball.x - gameData.ball.radius < 0)
//             {
//                 this.updateScore(gameData, gameData.playerId.player2Id);
//                 this.resetBoard(gameData);
//             }
//             else if (gameData.ball.x + gameData.ball.radius > this.screen.width)
//             {
//                 this.updateScore(gameData, gameData.playerId.player1Id);
//                 this.resetBoard(gameData);
//             }
//             else if (gameData.ball.y - gameData.ball.radius <= 0 || gameData.ball.y + gameData.ball.radius >= this.screen.height)
//             {
//                 gameData.ball.vectorRadians = Math.PI * 2 - gameData.ball.vectorRadians + 180;
//                 this.socketServer.sendBallData(gameData);
//             }
//             else if (gameData.ball.x - gameData.ball.radius <= gameData.paddle2.x + gameData.paddle2.width / 2 && gameData.ball.y > gameData.paddle2.y - gameData.paddle2.height / 2 && gameData.ball.y < gameData.paddle2.y + gameData.paddle2.height / 2)
//             {
//                 gameData.ball.vectorRadians = Math.PI * 2 - gameData.ball.vectorRadians + 180;
//                 gameData.ball.speed = gameData.ball.speed * 1.1;
//                 this.socketServer.sendBallData(gameData);
//             }
//             else if (gameData.ball.x + gameData.ball.radius >= gameData.paddle1.x - gameData.paddle1.width / 2 && gameData.ball.y > gameData.paddle1.y - gameData.paddle1.height / 2 && gameData.ball.y < gameData.paddle1.y + gameData.paddle1.height / 2)
//             {
//                 gameData.ball.vectorRadians = Math.PI * 2 - gameData.ball.vectorRadians + 180;
//                 gameData.ball.speed = gameData.ball.speed * 1.1;
//                 this.socketServer.sendBallData(gameData);
//             }
//         }
//     }

//     private async resetBoard(gameData: Data) {
//         this.initBall(gameData);
//         this.initPaddles(gameData);
//         this.socketServer.sendData(gameData);
//     }

//     private async initBall(gameData: Data) {
//         gameData.ball.x = screen.width / 2;
//         gameData.ball.y = screen.height / 2;
//         gameData.ball.radius = 10;
//         gameData.ball.speed = 5;
//         const rad = Math.random() * Math.PI * 2;
//         if (rad > Math.PI / 4 && rad < Math.PI * 3 / 4)
//            gameData.ball.vectorRadians = rad + Math.PI / 2;
//         else if (rad > Math.PI * 5 / 4 && rad < Math.PI * 7 / 4)
//             gameData.ball.vectorRadians = rad + Math.PI / 2;
//         else
//             gameData.ball.vectorRadians = rad;
//     }

//     private async initPaddles(gameData: Data) {
//         gameData.paddle1.y = this.screen.height / 2;
//         gameData.paddle1.x = this.screen.width - 20;
//         gameData.paddle1.width = 20;
//         gameData.paddle1.height = 100;
//         gameData.paddle2.y = this.screen.height / 2;
//         gameData.paddle2.x = 20;
//         gameData.paddle2.width = 20;
//         gameData.paddle2.height = 100;
//     }

//     private async updateScore(gameData: Data, playerId: number, player1Disconnect: boolean = false, player2Disconnect: boolean = false) {
//         if (playerId === gameData.playerId.player1Id)
//         {
//             gameData.score.player1Score++;
//             if (gameData.score.player1Score >= 10 || player2Disconnect)
//             {
//                 let game1 = new Game();
//                 game1.myEnemy = await this.userService.getUser(gameData.playerId.player2Id, true);
//                 game1.myScore = gameData.score.player1Score;
//                 game1.enemyScore = gameData.score.player2Score;
//                 this.gameRepository.save(game1);
//                 this.userService.getUser(gameData.playerId.player1Id, true).then((user) => {
//                     user.game.push(game1);
//                     user.games_won++;
//                     user.games_played++;
//                 });
//                 let game2 = new Game();
//                 game2.myEnemy = await this.userService.getUser(gameData.playerId.player1Id, true);
//                 game2.myScore = gameData.score.player2Score;
//                 game2.enemyScore = gameData.score.player1Score;
//                 this.gameRepository.save(game2);
//                 this.userService.getUser(gameData.playerId.player2Id, true).then((user) => {
//                     user.game.push(game2);
//                     user.games_lost++;
//                     user.games_played++;
//                 });
//             }
//         }
//         if (playerId === gameData.playerId.player2Id)
//         {
//             gameData.score.player2Score++;
//             if (gameData.score.player2Score >= 10 || player1Disconnect)
//             {
//                 let game1 = new Game();
//                 game1.myEnemy = await this.userService.getUser(gameData.playerId.player1Id, true);
//                 game1.myScore = gameData.score.player2Score;
//                 game1.enemyScore = gameData.score.player1Score;
//                 this.gameRepository.save(game1);
//                 this.userService.getUser(gameData.playerId.player2Id, true).then((user) => {
//                     user.game.push(game1);
//                     user.games_won++;
//                     user.games_played++;
//                 });
//                 let game2 = new Game();
//                 game2.myEnemy = await this.userService.getUser(gameData.playerId.player2Id, true);
//                 game2.myScore = gameData.score.player1Score;
//                 game2.enemyScore = gameData.score.player2Score;
//                 this.gameRepository.save(game2);
//                 this.userService.getUser(gameData.playerId.player1Id, true).then((user) => {
//                     user.game.push(game2);
//                     user.games_lost++;
//                     user.games_played++;
//                 });
//             }
//         }
//     }

//     async updatePadPosition(playerId: number, paddleAction: string)
//     {
//         let gameData: Data = this.find(playerId);
//         if (gameData.playerId.player1Id === playerId)
//         {
//             if (paddleAction === "up")
//                 gameData.paddle1.y += 5;
//             else
//                 gameData.paddle1.y -= 5;
//             this.socketServer.sendPadPosition(gameData.playerId.player2Id, gameData.playerId.player1Id ,gameData.paddle1.y ,gameData.screen);
//         }
//         else
//         {
//             if (paddleAction === "up")
//                 gameData.paddle2.y += 5;
//             else
//                 gameData.paddle2.y -= 5;
//             this.socketServer.sendPadPosition(gameData.playerId.player1Id, gameData.playerId.player2Id,gameData.paddle2.y ,gameData.screen);
//         }
//     }

//     async playerDisconnect(playerId: number)
//     {
//         let gameData: Data = this.find(playerId);
//         if (gameData.playerId.player1Id === playerId)
//         {
//             this.updateScore(gameData, playerId, true);
//             this.socketServer.endGame(gameData.playerId.player2Id, playerId, true);
//         }
//         else
//         {
//             this.updateScore(gameData, playerId, false, true);
//             this.socketServer.endGame(gameData.playerId.player2Id, playerId, true);
//         }
//         this.GameMap.delete(gameData.playerId);

//     }
// }