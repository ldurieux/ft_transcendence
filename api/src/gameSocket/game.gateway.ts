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
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
@WebSocketGateway({
    transports: ['websocket'],
    path: '/game',
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private gameInstance: Map<number, gameInterface.Game>;
    private playerInGame: Set<number>;

    constructor(
        @InjectRepository(Game)
        private gameRepository: Repository<Game>,
        private jwtService: JwtService,
        private readonly userService: UserService,
    ) {
        this.gameInstance = new Map<number, gameInterface.Game>();
        this.playerInGame = new Set<number>();
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

    async getSocket(id: number): Promise<WebSocket> {
        for (const client of this.server.clients) {
            if (client.data.user === id) {
                return client;
            }
        }
        return null;
    }

    
    @SubscribeMessage('auth')
    async handleAuth(@ConnectedSocket() client: WebSocket, @MessageBody('data') authHeader: any) {
        GameGateway.serverRef = this.server;

        console.log('auth');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            client.terminate();
            console.log("Bearer")
            return;
        }

        const token = authHeader.split(' ')[1];
        if (typeof token !== 'string' || token == "null") {
            client.terminate();
            console.log("null")
            return;
        }

        try {
          const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
          const { id } = payload;

          client.data.user = id;
        } catch (err) {
            client.terminate();
            console.log(client.data, err,"No headers")
            return;
        }
    }

    async getClientId(client: WebSocket): Promise<number> {
        return client.data.user;
    }

    async wait(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }

    async isInGame(playerId: number): Promise<boolean> {
        if (this.playerInGame.has(playerId))
            return true;
        return false;
    }

    async synchronizedPlayer(player1: number, player2: number, gameId: number)
    {
        let nSync = 0;
        let socket1: WebSocket;
        let socket2: WebSocket;
        socket1 = null;
        socket2 = null;
        console.log('synchronizedPlayer');
        while (nSync < 5 && (socket1 === null || socket2 === null))
        {
            socket1 = await this.getSocket(player1);
            socket2 = await this.getSocket(player2);
            if (!socket1 || !socket2)
                await this.wait(1000);
            nSync++;
        }
        if (nSync === 5 || socket1 === null || socket2 === null)
        {
            if (socket1 != null)
                socket1.send(JSON.stringify({type: 'Error', Error: 'PlayerNotConnected'}));
            if (socket2 != null)
                socket2.send(JSON.stringify({type: 'Error', Error: 'PlayerNotConnected'}));
        }
        this.playerInGame.add(player1);
        this.playerInGame.add(player2);
        socket1.send(JSON.stringify({type: 'synchronized', gameId: gameId, myId: 1}));
        socket2.send(JSON.stringify({type: 'synchronized', gameId: gameId, myId: 2}));
        if (this.gameInstance.get(gameId).typeOfGame === 1)
            this.classicGameRoutine(player1, player2, gameId, socket1, socket2);
        else if (this.gameInstance.get(gameId).typeOfGame === 2)
            this.deluxeGameRoutine(player1, player2, gameId, socket1, socket2);
    }

    @SubscribeMessage('movePaddle')
    async movePaddle(@ConnectedSocket() client: WebSocket, @MessageBody() data: {gameId: number, player: number, direction: number})
    {

        console.log('movePaddle', data);
        if (await this.checkIfGameExist(data.gameId) === false)
            client.send(JSON.stringify({type: 'Error', Error: 'GameNotExist'}));
        const game = this.gameInstance.get(data.gameId);
        const socket1 = await this.getSocket(game.player1.getPlayerId());
        const socket2 = await this.getSocket(game.player2.getPlayerId());
        game.movePaddle(data.player, data.direction, socket1, socket2);
    }

    @SubscribeMessage('stopPaddle')
    async stopPaddle(@ConnectedSocket() client: WebSocket, @MessageBody() data: {gameId: number, player: number})
    {
        console.log('stopPaddle = ', data);
        if (await this.checkIfGameExist(data.gameId) === false)
            client.send(JSON.stringify({type: 'Error', Error: 'GameNotExist'}));
        const game = this.gameInstance.get(data.gameId);
        game.stopPaddle(data.player);
        const socket1 = await this.getSocket(game.player1.getPlayerId());
        const socket2 = await this.getSocket(game.player2.getPlayerId());
        socket1.send(JSON.stringify({type: 'paddlePos', paddle: game.player1.paddle.getPaddleData, paddlePlayer: data.player, screen: game.getScreen}));
        socket2.send(JSON.stringify({type: 'paddlePos', paddle: game.player2.paddle.getPaddleData, paddlePlayer: data.player, screen: game.getScreen}));
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
        let gameId: number = Math.floor(Math.random() * 1000000000);
        while (gameId === 0 || this.gameInstance.has(gameId))
            gameId = Math.floor(Math.random() * 1000000000);
        this.gameInstance.set(gameId, game);
        console.log('createGame');
        this.synchronizedPlayer(player1, player2, gameId);
    }

    async gameEnd(gameId: number, game: gameInterface.Game, disconnect: boolean = false) {
        const Game1 = new Game();
        const Game2 = new Game();

        this.playerInGame.delete(game.player1.getPlayerId());
        this.playerInGame.delete(game.player2.getPlayerId());
        Game1.myScore = (await game.whoWin()).getScore();
        Game1.enemyScore = (await game.whoLose()).getScore();
        Game1.Win = true;
        Game1.myEnemy = await this.userService.getUser((await game.whoLose()).getPlayerId(), true);
        Game2.myScore = (await game.whoLose()).getScore();
        Game2.enemyScore = (await game.whoWin()).getScore();
        Game2.Win = false;
        Game2.myEnemy = await this.userService.getUser((await game.whoWin()).getPlayerId(), true);

        await this.gameRepository.save(Game1);
        await this.userService.getUser((await game.whoWin()).getPlayerId(), true).then((user) => {
            user.game.push(Game1);
            user.games_won++;
            user.games_played++;
        });
        await this.gameRepository.save(Game2);
        await this.userService.getUser((await game.whoLose()).getPlayerId(), true).then((user) => {
            user.game.push(Game2);
            user.games_lost++;
            user.games_played++;
        });
        game.destroyGame();
        this.gameInstance.delete(gameId);
    }

    async classicGameRoutine(player1:number, player2:number, gameId: number, socket1: WebSocket, socket2: WebSocket)
    {
        const game = this.gameInstance.get(gameId);
        let gameContinue: boolean = true;

        game.gameInit(player1, player2, socket1, socket2);
        while (gameContinue)
        {
            if (socket1.readyState !== socket1.OPEN)
            {
                game.playerDisconnect(player1);
                this.gameEnd(gameId, game, true);
                return;
            }
            if (socket2.readyState !== socket2.OPEN)
            {
                game.playerDisconnect(player2);
                this.gameEnd(gameId, game, true);
                return;
            }
            await game.moveBall();
            gameContinue = await game.checkCollision(socket1, socket2);
            await game.sendBallPos(socket1, socket2);
            await this.wait(16);
        }
        console.log('score1 = ', await game.player1.getScore(), 'score2 = ', await game.player2.getScore());
        this.gameEnd(gameId, game);
    }

    async deluxeGameRoutine(player1:number, player2:number, gameId: number, socket1: WebSocket, socket2: WebSocket)
    {
        const game = this.gameInstance.get(gameId);
        let gameContinue:boolean = true;
        let activeGameEffect: boolean = false;
        let gameEffect: number = 0

        game.gameInit(player1, player2, socket1, socket2);
        while (gameContinue)
        {
            if (socket1.readyState !== socket1.OPEN)
            {
                game.playerDisconnect(player1);
                this.gameEnd(gameId, game, true);
                return;
            }
            if (socket2.readyState !== socket2.OPEN)
            {
                game.playerDisconnect(player2);
                this.gameEnd(gameId, game, true);
                return;
            }
            await game.moveBall();
            gameContinue = await game.checkCollision(socket1, socket2);
            await game.sendBallPos(socket1, socket2);
            if (gameEffect % 2000 === 0)
                await game.gameEffect(activeGameEffect, socket1, socket2);
            if (gameEffect % 500 === 0)
                await game.releaseGameEffect(activeGameEffect, socket1, socket2);
            await this.wait(16);
            gameEffect += 16;

        }
        this.gameEnd(gameId, game);
    }
}