import { Inject, UseGuards, Injectable, ValidationPipe, forwardRef } from '@nestjs/common';

import { OnGatewayConnection, OnGatewayDisconnect, MessageBody, OnGatewayInit ,SubscribeMessage, WebSocketGateway, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';

import { WebSocket } from 'ws';

import { JwtService } from '@nestjs/jwt';


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
        const game = this.gameInstance.get(data.gameId);
        const socket1 = this.getSocket(game.player1.getPlayerId());
        const socket2 = this.getSocket(game.player2.getPlayerId());
        game.movePaddle(data.player, data.direction, socket1, socket2);
    }

    @SubscribeMessage('stopPaddle')
    async stopPaddle(@ConnectedSocket() client: WebSocket, @MessageBody('data') data: {gameId: number, player: number})
    {
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

    async classicGameRoutine(gameId: number, socket1: WebSocket, socket2: WebSocket)
    {
        const game = this.gameInstance.get(gameId);
        const player1 = game.player1.getPlayerId();
        const player2 = game.player2.getPlayerId();
        let gameContinue: boolean = true;

        game.gameInit(player1, player2, socket1, socket2);
        while (gameContinue)
        {
            await game.moveBall();
            gameContinue = await game.checkCollision(socket1, socket2);
            await game.sendBallPos(socket1, socket2);
            this.wait(4);
        }
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
    }
}




















    // private clientWaitingStack: Deque<number>;

    // async matchMaking(@ConnectedSocket() client: WebSocket, data: {id: number}) {
    //     this.userService.getUser(data.id);
    //     if (this.clientWaitingStack.length() === 0)
    //     {
    //         this.clientWaitingStack.push({id: data.id, socket: client});
    //         return;
    //     }
    //     const friend: WaitingPlayer = this.clientWaitingStack.pop();
    //     if (friend.socket.readyState !== friend.socket.OPEN)
    //     {
    //         this.clientWaitingStack.push({id: data.id, socket: client});
    //         return;
    //     }
    //     friend.socket.send(JSON.stringify({type: 'MatchMaking', id: data.id}));
    //     client.send(JSON.stringify({type: 'MatchMaking', id: friend.id}));
    //     this.gameStart(friend.id, data.id);
    // }

    // @UseGuards(SocketGuard)
    // @SubscribeMessage('gameInvite')
    // async gameInvite(@ConnectedSocket() client: WebSocket, @MessageBody( new ValidationPipe()) data: {id: number, friendId: number}) {
    //     const user: User = await this.userService.getUser(data.id);
    //     if (user === null || user === undefined)
    //     {
    //         client.send(JSON.stringify({type: 'Error', Error: 'YouNotExist'}));
    //         return;
    //     }
    //     const friend = await this.userService.getUser(data.friendId);
    //     if (!friend)
    //     {
    //         client.send(JSON.stringify({type: 'Error', Error: 'FriendNotExists'}));
    //         return;
    //     }
    //     const friendSocket = this.socketServer.getSocket(friend.id);
    //     if (!friendSocket) 
    //     {
    //         client.send(JSON.stringify({type: 'Error', Error: 'FriendNotOnline'}));
    //         return;
    //     }
    //     if (this.InGame.has(data.friendId))
    //     {
    //         client.send(JSON.stringify({type: 'Error', Error: 'FriendInGame'}));
    //         return;
    //     }
    //     friendSocket.send(JSON.stringify({type: 'gameInvite', id: data.id, friendId: data.friendId, whoInvit: user}));
    //     client.send(JSON.stringify({type: 'gameInvite', id: data.friendId, friendId: data.id}));
    // }

    // async gameInviteResponse(data: {id: number, friendId: number, response: boolean}) {
    //     const friend = await this.userService.getUser(data.friendId);
    //     const friendSocket = this.socketServer.getSocket(friend.id);
    //     const clientSocket = this.socketServer.getSocket(data.id);  
    //     if (clientSocket.readyState !== clientSocket.OPEN)
    //         return;
    //     if (friendSocket.readyState !== friendSocket.OPEN)
    //     {
    //         clientSocket.send(JSON.stringify({type: 'Error', Error: 'FriendNotOnline'}));
    //         return;
    //     }
    //     if (data.response == false)
    //     {
    //         friendSocket.send(JSON.stringify({type: 'gameInviteResponse', response: false}));
    //         return;
    //     }
    //     this.gameStart(data.id, data.friendId);
    // }

    // @UseGuards(SocketGuard)
    // @SubscribeMessage('padPosition')
    // async receivePadPosition(@ConnectedSocket() client: WebSocket, @MessageBody( new ValidationPipe()) data: {paddleY: number}) {
    //     const user = await this.userService.getUser(this.socketServer.getId(client));
    //     this.gameService.updatePadPosition(user.id, data.paddleY);
    // }

    // async sendPadPosition(id: number, paddleY: number, screen: GameScreen) {
    //     const client = this.socketServer.getSocket(id);
    //     if (client.readyState !== client.OPEN)
    //     {
    //         this.gameService.playerDisconnect(id);
    //         return;
    //     }
    //     client.send(JSON.stringify({type: 'padPosition', position: paddleY, screen: screen}));
    // }

    // async sendBallData(gameData: GameData) {

    //     const client1 = this.socketServer.getSocket(gameData.playerId.player1Id);
    //     const client2 = this.socketServer.getSocket(gameData.playerId.player2Id);
    //     if (client1.readyState !== client1.OPEN)
    //     {
    //         this.gameService.playerDisconnect(gameData.playerId.player1Id);
    //         return;
    //     }
    //     if (client2.readyState !== client2.OPEN)
    //     {
    //         this.gameService.playerDisconnect(gameData.playerId.player2Id);
    //         return;
    //     }
    //     client1.send(JSON.stringify({type: 'ballData', ball: gameData.ball, screen: gameData.screen}));
    //     client2.send(JSON.stringify({type: 'ballData', ball: gameData.ball, screen: gameData.screen}));
    // }

    // async sendScoreData(gameData: GameData) {
    //     const client1 = this.socketServer.getSocket(gameData.playerId.player1Id);
    //     const client2 = this.socketServer.getSocket(gameData.playerId.player2Id);
    //     if (client1.readyState !== client1.OPEN)
    //     {
    //         this.gameService.playerDisconnect(gameData.playerId.player1Id);
    //         return;
    //     }
    //     if (client2.readyState !== client2.OPEN)
    //     {
    //         this.gameService.playerDisconnect(gameData.playerId.player2Id);
    //         return;
    //     }
    //     client1.send(JSON.stringify({type: 'scoreData', score: gameData.score}));
    //     client2.send(JSON.stringify({type: 'scoreData', score: gameData.score}));
    // }

    // async gameStart(id: number, friendId: number) {
    //     this.InGame.add(id);
    //     this.InGame.add(friendId);
    //     this.gameService.PongGame(id, friendId);
    // }

    // async endGame(winner: number, loser: number, disconnect: boolean = false) {
    //     this.InGame.delete(winner);
    //     this.InGame.delete(loser);
    //     const winnerSocket = this.socketServer.getSocket(winner);
    //     const loserSocket = this.socketServer.getSocket(loser);
    //     if (disconnect)
    //     {
    //         if (winnerSocket.readyState === winnerSocket.OPEN)
    //             winnerSocket.send(JSON.stringify({type: 'gameEnd', win: true, disconnect: true}));
    //     }
    //     else
    //     {
    //         if (winnerSocket.readyState === winnerSocket.OPEN)
    //             winnerSocket.send(JSON.stringify({type: 'gameEnd', win: true, disconnect: false}));
    //         if (loserSocket.readyState === loserSocket.OPEN)
    //             loserSocket.send(JSON.stringify({type: 'gameEnd', win: false, disconnect: false}));
    //     }
    // }

    // async sendData(GameData: GameData) {
    //     const socket1 = this.socketServer.getSocket(GameData.playerId.player1Id);
    //     const socket2 = this.socketServer.getSocket(GameData.playerId.player2Id);
    //     if (socket1.readyState !== socket1.OPEN)
    //     {
    //         this.gameService.playerDisconnect(GameData.playerId.player1Id);
    //         return;
    //     }
    //     if (socket2.readyState !== socket2.OPEN)
    //     {
    //         this.gameService.playerDisconnect(GameData.playerId.player2Id);
    //         return;
    //     }
    //     socket1.send(JSON.stringify({type: 'gameData', data: GameData}));
    //     socket2.send(JSON.stringify({type: 'gameData', data: GameData}));
    // }

    // async delay(ms: number) {
    //     return new Promise( resolve => setTimeout(resolve, ms) );
    // }

    // async synchronizePlayer(gameData: GameData)
    // {
    //     const client1 = this.socketServer.getSocket(gameData.playerId.player1Id);
    //     const client2 = this.socketServer.getSocket(gameData.playerId.player2Id);
    //     await this.delay(3000);
    //     client1.send({type: "start"});
    //     client2.send({type: "start"});
    // }

    // @UseGuards(SocketGuard)
    // @SubscribeMessage('userStatus')
    // async takeUserStatus(client: WebSocket, id: number) {
    //     if (this.InGame.has(id))
    //     {
    //         client.send(JSON.stringify({type: 'userStatus', status: 'InGame'}));
    //     }
    //     else
    //     {
    //         client.send(JSON.stringify({type: 'userStatus', status: 'Available'}));
    //     }
    // }
