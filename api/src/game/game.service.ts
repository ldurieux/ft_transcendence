import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Game } from './game.entity';

import { UserService } from 'src/user/user.service';

import { GameReply } from 'src/socket/game.reply';

import * as gameInterface from './gameInterface';

import { GameGateway } from 'src/gameSocket/game.gateway';


@Injectable()
export class GameService {

    private gameInstance: Map<number, gameInterface.Game>;

    constructor(
        private readonly gameRepository: Repository<Game>,
        private readonly userService: UserService,
        private readonly gameGateway: GameGateway,
    ) {
        this.gameInstance = new Map<number, gameInterface.Game>();
    }

    async checkIfGameExist(gameId: number) {
        const game = this.gameInstance.get(gameId);
        if (!game)
            return false;
        return true;
    }

    async createGame(player1: number, player2: number, typeOfGame: number) {
        const game = new gameInterface.Game();
        game.gameInit(typeOfGame, player1, player2);
        const gameId: number = Math.floor(Math.random() * 1000000000);
        this.gameInstance.set(gameId, game);
        console.log('createGame');
        this.gameGateway.synchronizedPlayer(player1, player2, gameId);
    }

    async movePadle(playerId: number, direction: number, gameId: number) {
        const game = this.gameInstance.get(gameId);
        game.movePaddle(playerId, direction);
    }
}

//     async PongGame(gameInstance: gameInterface.GameInstance) {
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