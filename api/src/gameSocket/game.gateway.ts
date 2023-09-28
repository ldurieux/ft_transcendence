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

import { User } from 'src/user/user.entity';
import { get } from 'http';

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
    }
    
    async handleDisconnect(client: WebSocket) {
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
        if (await this.isInGame(client.data.user) === true)
        {
            this.rejoinGame(client.data.user);
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
        let socket1: WebSocket = null;
        let socket2: WebSocket = null
        console.log('synchronizedPlayer');
        while (nSync < 5 && (socket1 === null || socket2 === null))
        {
            socket1 = await this.getSocket(player1);
            socket2 = await this.getSocket(player2);
            await this.wait(1000);
            nSync++;
        }
        if (nSync >= 5)
        {
            if (socket1 !== null)
                socket1.send(JSON.stringify({type: 'Error', Error: 'PlayerNotConnected'}));
            if (socket2 !== null)
                socket2.send(JSON.stringify({type: 'Error', Error: 'PlayerNotConnected'}));
            return;
        }
        this.playerInGame.add(player1);
        this.playerInGame.add(player2);
        socket1.send(JSON.stringify({type: 'synchronized', gameId: gameId, myId: 1}));
        socket2.send(JSON.stringify({type: 'synchronized', gameId: gameId, myId: 2}));
        socket1.data.inGame = true;
        socket2.data.inGame = true;
        if (this.gameInstance.get(gameId).typeOfGame === 1)
            this.classicGameRoutine(player1, player2, gameId);
        else if (this.gameInstance.get(gameId).typeOfGame === 2)
            this.deluxeGameRoutine(player1, player2, gameId);
    }

    @SubscribeMessage('movePaddle')
    async movePaddle(@ConnectedSocket() client: WebSocket, @MessageBody() data: {gameId: number, player: number, direction: number})
    {
        console.log('movePaddle', data);
        if (await this.checkIfGameExist(data.gameId) === false)
        {
            client.send(JSON.stringify({type: 'Error', Error: 'GameNotExist'}));
            return;
        }
        const game = this.gameInstance.get(data.gameId);
        const socket1 = await this.getSocket(game.player1.getPlayerId());
        const socket2 = await this.getSocket(game.player2.getPlayerId());
        game.movePaddle(data.player, data.direction, socket1, socket2);
    }

    @SubscribeMessage('stopPaddle')
    async stopPaddle(@ConnectedSocket() client: WebSocket, @MessageBody() data: {gameId: number, player: number})
    {

        if (await this.checkIfGameExist(data.gameId) === false)
        {
            client.send(JSON.stringify({type: 'Error', Error: 'GameNotExist'}));
            return;
        }
        const game = this.gameInstance.get(data.gameId);
        game.stopPaddle(data.player);
        const socket1 = await this.getSocket(game.player1.getPlayerId());
        const socket2 = await this.getSocket(game.player2.getPlayerId());
        if (socket1 !== null)
            socket1.send(JSON.stringify({type: 'paddlePos', paddle: game.player1.paddle.getPaddleData(), paddlePlayer: data.player, screen: await game.getScreen()}));
        if (socket2 !== null)
            socket2.send(JSON.stringify({type: 'paddlePos', paddle: game.player2.paddle.getPaddleData(), paddlePlayer: data.player, screen: await game.getScreen()}));
    }

    async checkIfGameExist(gameId: number) {
        const game = this.gameInstance.get(gameId);
        if (!game)
            return false;
        return true;
    }

    async rejoinGame(clientId: number): Promise<boolean> {
        var socket: WebSocket = null;
        var nSync: number = 0;
        while (nSync < 5 && socket === null)
        {
            socket = await this.getSocket(clientId);
            await this.wait(1000);
            nSync++;
        }
        if (nSync >= 5)
            return false;
        this.gameInstance.forEach((value: gameInterface.Game, key: number) => {
            if (value.player1.getPlayerId() === clientId || value.player2.getPlayerId() === clientId)
                socket.send(JSON.stringify({type: 'synchronized', gameId: key, myId: value.player1.getPlayerId() === clientId ? 1 : 2}));
        });
        socket.data.inGame = true;
        return true;
    }

    async createGame(player1: number, player2: number, typeOfGame: number) {
        const game = new gameInterface.Game();
        game.typeOfGame = typeOfGame;
        let gameId: number = Math.floor(Math.random() * 1000000000);
        while (gameId === 0 || this.gameInstance.has(gameId))
            gameId = Math.floor(Math.random() * 1000000000);
        this.gameInstance.set(gameId, game);
        this.synchronizedPlayer(player1, player2, gameId);
    }

    async gameEnd(gameId: number, game: gameInterface.Game, disconnect: boolean = false) {
        const Game1 = new Game();
        const Game2 = new Game();
        const socketwinner = await this.getSocket((await game.whoWin()).getPlayerId());
        const socketloser = await this.getSocket((await game.whoLose()).getPlayerId());

        this.playerInGame.delete(game.player1.getPlayerId());
        this.playerInGame.delete(game.player2.getPlayerId());
        Game1.myScore = (await game.whoWin()).getScore();
        Game1.enemyScore = (await game.whoLose()).getScore();
        Game1.opponentId = (await game.whoLose()).getPlayerId();
        Game1.Win = true;
        Game2.myScore = (await game.whoLose()).getScore();
        Game2.enemyScore = (await game.whoWin()).getScore();
        Game2.opponentId = (await game.whoWin()).getPlayerId();
        Game2.Win = false;

        console.log(Game1, Game2);
        await this.gameRepository.save(Game1);
        await this.userService.getUser((await game.whoWin()).getPlayerId(), true).then((user) => {
            if (user.game === undefined)
                user.game = [];
            user.game.push(Game1);
            if (user.games_won === undefined)
                user.games_won = 0;
            user.games_won++;
            if (user.games_played === undefined)
                user.games_played = 0;
            user.games_played++;
        });
        await this.gameRepository.save(Game2);
        await this.userService.getUser((await game.whoLose()).getPlayerId(), true).then((user) => {
            if (user.game === undefined)
                user.game = [];
            user.game.push(Game2);
            if (user.games_won === undefined)
                user.games_won = 0;
            user.games_lost++;
            if (user.games_played === undefined)
                user.games_played = 0;
            user.games_played++;
        });
        if (socketwinner !== null)
            socketwinner.send(JSON.stringify({type: 'WIN'}));
        if (socketloser !== null)
            socketloser.send(JSON.stringify({type: 'LOSE'}));
        game.destroyGame();
        this.gameInstance.delete(gameId);
    }

    async classicGameRoutine(player1:number, player2:number, gameId: number)
    {
        var socket1: WebSocket = await this.getSocket(player1);
        var socket2: WebSocket = await this.getSocket(player2);
        const game = this.gameInstance.get(gameId);
        let gameContinue: boolean = true;

        await game.gameInit(player1, player2, socket1, socket2);
        while (gameContinue)
        {
            if (socket1 === null || socket1.readyState === 3)
            {
                socket1 = await this.getSocket(game.player1.getPlayerId());
                if (socket1 !== null)
                    socket1.send(JSON.stringify({type: 'reconnect', paddle1: game.getPaddlePos(1), paddle2: game.getPaddlePos(2), screen: game.getScreen()}))
            }
            if (socket2 === null || socket2.readyState === 3)
            {
                socket2 = await this.getSocket(game.player2.getPlayerId());
                if (socket2 !== null)
                    socket1.send(JSON.stringify({type: 'reconnect', paddle1: game.getPaddlePos(1), paddle2: game.getPaddlePos(2), screen: game.getScreen()}))
            }
            await game.moveBall();
            gameContinue = await game.checkCollision(socket1, socket2);
            await game.sendBallPos(socket1, socket2);
            await this.wait(10);
        }
        this.gameEnd(gameId, game);
    }

    async deluxeGameRoutine(player1:number, player2:number, gameId: number)
    {
        var socket1: WebSocket = await this.getSocket(player1);
        var socket2: WebSocket = await this.getSocket(player2);
        const game = this.gameInstance.get(gameId);
        let gameContinue:boolean = true;
        let gameEffect: number = 20;

        await game.gameInit(player1, player2, socket1, socket2);
        while (gameContinue)
        {
            if (socket1 === null || socket1.readyState === 3)
            {
                socket1 = await this.getSocket(game.player1.getPlayerId());
                if (socket1 !== null)
                    socket1.send(JSON.stringify({type: 'reconnect', paddle1: game.getPaddlePos(1), paddle2: game.getPaddlePos(2), screen: game.getScreen()}))
            }
            if (socket2 === null || socket2.readyState === 3)
            {
                socket2 = await this.getSocket(game.player2.getPlayerId());
                if (socket2 !== null)
                    socket1.send(JSON.stringify({type: 'reconnect', paddle1: game.getPaddlePos(1), paddle2: game.getPaddlePos(2), screen: game.getScreen()}))
            }
            await game.moveBall();
            gameContinue = await game.checkCollision(socket1, socket2);
            await game.sendBallPos(socket1, socket2);
            if (gameEffect % 4000 === 0)
                await game.gameEffect(socket1, socket2);
            else if (gameEffect % 1000 === 0)
                game.releaseGameEffect();
            await this.wait(10);
            gameEffect += 10;

        }
        this.gameEnd(gameId, game);
    }
}