import { Inject, UseGuards, Injectable, ValidationPipe, forwardRef } from '@nestjs/common';

import { OnGatewayConnection, OnGatewayDisconnect, MessageBody, OnGatewayInit ,SubscribeMessage, WebSocketGateway, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';

import { WebSocket } from 'ws';

import { JwtService } from '@nestjs/jwt';

import { Game } from '../game/game.entity';

import { Repository } from 'typeorm';

import { UserService } from 'src/user/user.service';


import * as gameInterface from '../game/gameInterface';
import { subscribe } from 'diagnostics_channel';
import { connected } from 'process';

@Injectable()
@WebSocketGateway({
    transports: ['websocket'],
    path: '/game',
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private gameInstance: Map<number, gameInterface.Game>;
    constructor(
        private jwtService: JwtService,
        private readonly gameRepository: Repository<Game>,
        private readonly userService: UserService,
    ) {
        this.gameInstance = new Map<number, gameInterface.Game>();
    }

    @WebSocketServer() server: WebSocket;
    static serverRef;

    async afterInit(server: WebSocket) {
    }

    async handleConnection(client: WebSocket) {
        client.data = {}
        console.log('Client isConnected to game');
    }
    
    async handleDisconnect(client: WebSocket) {
        console.log('Client disconnected to game');
    }

    async getSocket(id: number): WebSocket {
        for (const client of this.server.clients) {
            if (client.data.user === id) {
                return client;
            }
        }
        return null;
    }

    async getClientId(client: WebSocket): Promise<number> {
        return client.data.user;
    }

    async wait(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }

    async synchronizedPlayer(player1: number, player2: number, gameId: number)
    {
        let nSync = 0;
        let socket1: WebSocket;
        let socket2: WebSocket;
        while (nSync < 5)
        {
            socket1 = this.getSocket(player1);
            socket2 = this.getSocket(player2);
            if (!socket1 || !socket2)
                this.wait(1000);
            nSync++;
        }
        if (nSync === 5)
        {
            if (socket1)
                socket1.send(JSON.stringify({type: 'Error', Error: 'PlayerNotConnected'}));
            if (socket2)
                socket2.send(JSON.stringify({type: 'Error', Error: 'PlayerNotConnected'}));
        }
        socket1.send(JSON.stringify({type: 'synchronized', gameId: gameId, player: 1}));
        socket2.send(JSON.stringify({type: 'synchronized', gameId: gameId, player: 2}));
        if (this.gameInstance.get(gameId).typeOfGame === 1)
            this.classicGameRoutine(gameId, socket1, socket2);
        else if (this.gameInstance.get(gameId).typeOfGame === 2)
            this.deluxeGameRoutine(gameId, socket1, socket2);
    }

    @SubscribeMessage('movePaddle')
    async movePaddle(@ConnectedSocket() client: WebSocket, @MessageBody('data') data: {gameId: number, player: number, direction: number})
    {
        if (await this.checkIfGameExist(data.gameId) === false)
            return;
        const game = this.gameInstance.get(data.gameId);
        const socket1 = this.getSocket(game.player1.getPlayerId());
        const socket2 = this.getSocket(game.player2.getPlayerId());
        game.movePaddle(data.player, data.direction, socket1, socket2);
    }

    @SubscribeMessage('stopPaddle')
    async stopPaddle(@ConnectedSocket() client: WebSocket, @MessageBody('data') data: {gameId: number, player: number})
    {
        if (await this.checkIfGameExist(data.gameId) === false)
            return;
        const game = this.gameInstance.get(data.gameId);
        game.stopPaddle(data.player);
        const socket1 = this.getSocket(game.player1.getPlayerId());
        const socket2 = this.getSocket(game.player2.getPlayerId());
        socket1.send(JSON.stringify({type: 'paddlePos', paddlePlayer: data.player, player: 1, position: game.player1.paddle.y}));
        socket2.send(JSON.stringify({type: 'paddlePos', paddlePlayer: data.player, player: 2, position: game.player2.paddle.y}));
    }

    async checkIfGameExist(gameId: number) {
        const game = this.gameInstance.get(gameId);
        if (!game)
            return false;
        return true;
    }

    async createGame(player1: number, player2: number, typeOfGame: number) {
        const game = new gameInterface.Game();
        game.typeOfGame = typeOfGame;
        const gameId: number = Math.floor(Math.random() * 1000000000);
        if (gameId === 0 || this.gameInstance.has(gameId))
            this.createGame(player1, player2, typeOfGame);
        this.gameInstance.set(gameId, game);
        console.log('createGame');
        this.synchronizedPlayer(player1, player2, gameId);
    }

    async gameEnd(gameId: number, game: gameInterface.Game, disconnect: boolean = false) {
        const Game1 = new Game();
        const Game2 = new Game();
        Game1.myScore = (await game.whoWin()).getScore();
        Game1.enemyScore = (await game.whoLose()).getScore();
        Game1.Win = true;
        Game1.myEnemy = await this.userService.getUser((await game.whoLose()).getPlayerId(), true);
        Game2.myScore = (await game.whoLose()).getScore();
        Game2.enemyScore = (await game.whoWin()).getScore();
        Game2.Win = false;
        Game2.myEnemy = await this.userService.getUser((await game.whoWin()).getPlayerId(), true);
        this.gameRepository.save(Game1);
        await this.userService.getUser((await game.whoWin()).getPlayerId(), true).then((user) => {
            user.game.push(Game1);
            user.games_won++;
            user.games_played++;
        });
        this.gameRepository.save(Game2);
        await this.userService.getUser((await game.whoLose()).getPlayerId(), true).then((user) => {
            user.game.push(Game2);
            user.games_lost++;
            user.games_played++;
        });
    }


    async classicGameRoutine(gameId: number, socket1: WebSocket, socket2: WebSocket)
    {
        const game = this.gameInstance.get(gameId);
        const player1 = game.player1.getPlayerId();
        const player2 = game.player2.getPlayerId();
        let gameContinue: boolean = true;

        game.gameInit(player1, player2, socket1, socket2);
        while (gameContinue)
        {
            if (socket1.readyState !== socket1.OPEN)
            {
                game.playerDisconnect(player1);
                this.gameEnd(gameId, game);
                return;
            }
            if (socket2.readyState !== socket2.OPEN)
            {
                game.playerDisconnect(player2);
                this.gameEnd(gameId, game);
                return;
            }
            await game.moveBall();
            gameContinue = await game.checkCollision(socket1, socket2);
            await game.sendBallPos(socket1, socket2);
            this.wait(4);
        }
        this.gameEnd(gameId, game);
    }

    async deluxeGameRoutine(gameId: number, socket1: WebSocket, socket2: WebSocket)
    {
        const game = this.gameInstance.get(gameId);
        const player1 = game.player1.getPlayerId();
        const player2 = game.player2.getPlayerId();
        let gameContinue:boolean = true;
        let activeGameEffect: boolean = false;
        let gameEffect: number = 0

        game.gameInit(player1, player2, socket1, socket2);
        while (gameContinue)
        {
            if (socket1.readyState !== socket1.OPEN)
            {
                game.playerDisconnect(player1);
                this.gameEnd(gameId, game);
                return;
            }
            if (socket2.readyState !== socket2.OPEN)
            {
                game.playerDisconnect(player2);
                this.gameEnd(gameId, game);
                return;
            }
            await game.moveBall();
            gameContinue = await game.checkCollision(socket1, socket2);
            await game.sendBallPos(socket1, socket2);
            if (gameEffect % 2000 === 0)
                await game.gameEffect(activeGameEffect, socket1, socket2);
            if (gameEffect % 500 === 0)
                await game.releaseGameEffect(activeGameEffect, socket1, socket2);
            this.wait(4);
            gameEffect += 4;
        }
        this.gameEnd(gameId, game);
    }
}