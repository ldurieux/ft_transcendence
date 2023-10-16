import * as gameInterface from '../game/game.service';

import { InjectRepository } from '@nestjs/typeorm';

import { ZodValidationPipe } from '../validationPipe/zod.pipe';

import { WebSocket } from 'ws';

import { JwtService } from '@nestjs/jwt';

import { Game } from '../game/game.entity';

import { User } from '../user/user.entity';

import { Repository } from 'typeorm';

import { UserService } from 'src/user/user.service';

import { SocketServer } from 'src/socket/socket.server';

import {
    Injectable,
    UsePipes
} from '@nestjs/common';

import { 
    OnGatewayConnection, 
    OnGatewayDisconnect,
    MessageBody,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    ConnectedSocket,
    WebSocketServer
} from '@nestjs/websockets';

import {
    MovePaddle,
    StopPaddle,
} from '../game/game.interface';


import {    
    movePaddleSchema,
    stopPaddleSchema 
} from 'src/validationPipe/game.schema';

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
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
        private readonly userService: UserService,
        private readonly socketServer: SocketServer
    ) {
        this.gameInstance = new Map<number, gameInterface.Game>();
        this.playerInGame = new Set<number>();
    }

    @WebSocketServer() server: WebSocket;
    static serverRef;

    static instance() {
        return this.serverRef;
    }

    async getPlayerInGame(): Promise<Set<number>> {
        return this.playerInGame;
    }

    async afterInit(server: WebSocket) {
    }

    async handleConnection(client: WebSocket) {
        client.data = {}
    }
    
    async handleDisconnect(client: WebSocket) {
        this.server.clients.delete(client);
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
            return;
        }

        const token = authHeader.split(' ')[1];
        if (typeof token !== 'string' || token == "null") {
            client.terminate();
            return;
        }

        try {
          const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
          const { id } = payload;

          client.data.user = id;
        } catch (err) {
            client.terminate();
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
        this.playerInGame.add(player1);
        this.playerInGame.add(player2);
        while (nSync < 5 && (socket1 === null || socket2 === null))
        {
            socket1 = await this.getSocket(player1);
            socket2 = await this.getSocket(player2);
            await this.wait(1000);
            nSync++;
        }
        if (nSync >= 5)
        {
            this.playerInGame.delete(player1);
            this.playerInGame.delete(player2);
            if (socket1 !== null)
                socket1.send(JSON.stringify({type: 'Error', Error: 'PlayerNotConnected'}));
            if (socket2 !== null)
                socket2.send(JSON.stringify({type: 'Error', Error: 'PlayerNotConnected'}));
            return;
        }
        await this.socketServer.addToInGameList(player1)
        await this.socketServer.addToInGameList(player2);
        await this.socketServer.sendClientsToAll(player1);
        await this.socketServer.sendClientsToAll(player2);
        socket1.send(JSON.stringify({type: 'synchronized', gameId: gameId, myId: player1, opponentId: player2}));
        socket2.send(JSON.stringify({type: 'synchronized', gameId: gameId, myId: player2, opponentId: player1}));
        if (this.gameInstance.get(gameId).typeOfGame === 1)
            this.classicGameRoutine(player1, player2, gameId);
        else if (this.gameInstance.get(gameId).typeOfGame === 2)
            this.deluxeGameRoutine(player1, player2, gameId);
    }


    @UsePipes(new ZodValidationPipe(movePaddleSchema))
    @SubscribeMessage('movePaddle')
    async movePaddle(
        @MessageBody() payload: MovePaddle): 
        Promise<void>
    {
        if (await this.checkIfGameExist(payload.gameId) === false)
            return;
        const game = this.gameInstance.get(payload.gameId);
        const socket1 = await this.getSocket(game.player1.getPlayerId());
        const socket2 = await this.getSocket(game.player2.getPlayerId());
        await game.movePaddle(payload.player, payload.direction, socket1, socket2);
    }

    @UsePipes(new ZodValidationPipe(stopPaddleSchema))
    @SubscribeMessage('stopPaddle')
    async stopPaddle(
        @MessageBody() payload: StopPaddle): 
        Promise<void>
    {
        if (await this.checkIfGameExist(payload.gameId) === false)
            return;
        const game = this.gameInstance.get(payload.gameId);
        await game.stopPaddle(payload.player);
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
            {
                socket.send(JSON.stringify({type: 'synchronized', gameId: key, myId: clientId, opponentId: (value.player1.getPlayerId() === clientId ? value.player2.getPlayerId() : value.player1.getPlayerId())}));
                const game = this.gameInstance.get(key);
                game.reconnect(socket, clientId);
            }
        });
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

    async gameEnd(gameId: number, game: gameInterface.Game) {
        const Game1:Game = new Game();
        const Game2:Game = new Game();
        const socketwinner = await this.getSocket((await game.whoWin()).getPlayerId());
        const socketloser = await this.getSocket((await game.whoLose()).getPlayerId());
        game.stopPaddle(game.player1.getPlayerId());
        game.stopPaddle(game.player2.getPlayerId());

        let user1: User;
        let user2: User;

        try {
            user1 = await this.userService.getUser((await game.whoWin()).getPlayerId(), true, true);
            user2 = await this.userService.getUser((await game.whoLose()).getPlayerId(), true, true);
        }
        catch (e)
        {
            this.playerInGame.delete(game.player1.getPlayerId());
            this.playerInGame.delete(game.player2.getPlayerId());

            game.destroyGame();
            this.gameInstance.delete(gameId);
            return;
        }


        Game1.myScore = (await game.whoWin()).getScore();
        Game1.enemyScore = (await game.whoLose()).getScore();
        Game1.opponentId = (await game.whoLose()).getPlayerId();
        Game1.opponentName = user1.display_name;
        Game1.user = user1;
        Game1.Win = true;

        Game2.myScore = (await game.whoLose()).getScore();
        Game2.enemyScore = (await game.whoWin()).getScore();
        Game2.opponentId = (await game.whoWin()).getPlayerId();
        Game2.opponentName = user2.display_name;
        Game2.user = user2;
        Game2.Win = false;


        await this.gameRepository.save(Game2);
        await this.gameRepository.save(Game1);

        if (user1.game === undefined || user1.game === null)
            user1.game = [];
        await user1.game.push(Game1);
        if (user1.games_won === undefined)
            user1.games_won = 0;
        user1.games_won++;
        if (user1.games_played === undefined)
            user1.games_played = 0;
        user1.games_played++;

        if (user2.game === undefined || user2.game === null)
            user2.game = [];
        user2.game.push(Game2);
        if (user2.games_lost === undefined)
            user2.games_lost = 0;
        user2.games_lost++;
        if (user2.games_played === undefined)
            user2.games_played = 0;
        user2.games_played++;

        await this.userRepository.save(user1);
        await this.userRepository.save(user2);
        if (socketwinner !== null)
            socketwinner.send(JSON.stringify({type: 'whoWin', whoWin: "WIN"}));
        if (socketloser !== null)
            socketloser.send(JSON.stringify({type: 'whoWin', whoWin: "LOSE"}));

        this.playerInGame.delete(game.player1.getPlayerId());
        this.playerInGame.delete(game.player2.getPlayerId());

        game.destroyGame();
        this.gameInstance.delete(gameId);
    }

    async changePlayerStatus(playerId: number, status: boolean) {
        if (status === true)
            this.playerInGame.add(playerId);
        else
            this.playerInGame.delete(playerId);
    }

    async classicGameRoutine(player1:number, player2:number, gameId: number)
    {
        var socket1: WebSocket = await this.getSocket(player1);
        var socket2: WebSocket = await this.getSocket(player2);
        const game = this.gameInstance.get(gameId);
        let gameContinue: boolean = true;
        let disconnect: number = 0;

        await game.gameInit(player1, player2, socket1, socket2);
        while (gameContinue)
        {
            await game.moveBall();
            gameContinue = await game.checkCollision(socket1, socket2);
            await game.sendBallPos(socket1, socket2);
            await this.wait(16);
            if (socket1 === null || socket1.readyState === 3)
            {
                disconnect = await this.gamePause(player1, player2);
                socket1 = await this.getSocket(player1);
            }
            if (socket2 === null || socket2.readyState === 3)
            {
                disconnect = await this.gamePause(player1, player2);
                socket2 = await this.getSocket(player2);
            }
            if (disconnect)
                gameContinue = false;
        }
        await this.socketServer.removeFromInGameList(player1);
        await this.socketServer.removeFromInGameList(player2);
        await this.socketServer.sendClientsToAll(player1);
        await this.socketServer.sendClientsToAll(player2);
        if (disconnect === player1)
        {
            game.setWinner(game.player2.getPlayerId());
            game.player1.setScore(-1);
        }
        else if (disconnect === player2)
        {
            game.setWinner(game.player1.getPlayerId());
            game.player2.setScore(-1);
        }
        if (disconnect === -1)
            return await this.gameDisconnect(gameId, game);
        this.gameEnd(gameId, game);
    }

    async deluxeGameRoutine(player1:number, player2:number, gameId: number)
    {
        var socket1: WebSocket = await this.getSocket(player1);
        var socket2: WebSocket = await this.getSocket(player2);
        const game = this.gameInstance.get(gameId);
        let gameContinue:boolean = true;
        let disconnect: number = 0;
        let gameEffect: number = 16;

        await game.gameInit(player1, player2, socket1, socket2);
        while (gameContinue)
        {
            await game.moveBall();
            gameContinue = await game.checkCollision(socket1, socket2);
            await game.sendBallPos(socket1, socket2);
            if (gameEffect % 2000 === 0)
                await game.gameEffect(socket1, socket2);
            else if (gameEffect % 250 === 0)
                game.releaseGameEffect();
            await this.wait(16);
            gameEffect += 16;
            if (socket1 === null || socket1.readyState === 3)
            {
                disconnect = await this.gamePause(player1, player2);
                socket1 = await this.getSocket(player1);
            }
            if (socket2 === null || socket2.readyState === 3)
            {
                disconnect = await this.gamePause(player1, player2);
                socket2 = await this.getSocket(player2);
            }
            if (disconnect)
                gameContinue = false;
        }
        await this.socketServer.removeFromInGameList(player1);
        await this.socketServer.removeFromInGameList(player2);
        await this.socketServer.sendClientsToAll(player1);
        await this.socketServer.sendClientsToAll(player2);
        if (disconnect === player1)
        {
            game.setWinner(game.player2.getPlayerId());
            game.player1.setScore(-1);
        }
        else if (disconnect === player2)
        {
            game.setWinner(game.player1.getPlayerId());
            game.player2.setScore(-1);
        }
        if (disconnect === -1)
            return await this.gameDisconnect(gameId, game);
        this.gameEnd(gameId, game);
    }

    async gamePause(player1: number, player2: number): Promise<number>
    {
        var pause: number = 0;
        var socket1 = await this.getSocket(player1);
        var socket2 = await this.getSocket(player2);
        while ((socket1 === null || socket2 === null) && pause < 10)
        {
            if (socket1 !== null)
                socket1.send(JSON.stringify({type: 'PAUSE'}));
            if (socket2 !== null)
                socket2.send(JSON.stringify({type: 'PAUSE'}));
            socket1 = await this.getSocket(player1);
            socket2 = await this.getSocket(player2);
            if (socket1 === null && socket2 === null)
                return (-1);
            await this.wait(1000);
            pause += 1;
        }
        if (pause >= 10)
        {
            if (socket1 === null)
                return (player1);
            else
                return (player2);
        }
        if (socket1 !== null)
            socket1.send(JSON.stringify({type: 'RESUME'}));
        if (socket2 !== null)
            socket2.send(JSON.stringify({type: 'RESUME'}));
        return (0);
    }

    async gameDisconnect(gameId: number, game: gameInterface.Game): Promise<void>
    {
        this.playerInGame.delete(game.player1.getPlayerId());
        this.playerInGame.delete(game.player2.getPlayerId());
        game.destroyGame();
        this.gameInstance.delete(gameId);
    }
}