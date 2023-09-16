import { Inject, UseGuards, Injectable, ValidationPipe, forwardRef } from '@nestjs/common';

import { OnGatewayConnection, OnGatewayDisconnect, MessageBody, OnGatewayInit ,SubscribeMessage, WebSocketGateway, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';

import { WebSocket } from 'ws';

import { JwtService } from '@nestjs/jwt';

import { GameService } from '../game/game.service';

@Injectable()
@WebSocketGateway({
    transports: ['websocket'],
    path: '/game',
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private jwtService: JwtService,
        private readonly gameService: GameService,
    ) {}

    @WebSocketServer() server: WebSocket;
    static serverRef;

    afterInit(server: WebSocket) {
    }

    handleConnection(client: WebSocket) {
        client.data = {}
        console.log('Client isConnected to game');
    }
    
    handleDisconnect(client: WebSocket) {
        console.log('Client disconnected to game');
    }

    getSocket(id: number): WebSocket {
        for (const client of this.server.clients) {
            if (client.data.user === id) {
                return client;
            }
        }
        return null;
    }

    getClientId(client: WebSocket): number {
        return client.data.user;
    }

    paddleMove(client: WebSocket, data: {direction: number, gameId: number}) {
        this.gameService.movePadle(client.data.id, data.direction, data.gameId);
    }

    async synchronizedPlayer(player1: number, player2: number, gameId: number)
    {
        const socket1 = this.getSocket(player1);
        const socket2 = this.getSocket(player2);
        if (!socket1 || !socket2)
            return;
        socket1.send(JSON.stringify({type: 'synchronized', gameId: gameId, player: 1}));
        socket2.send(JSON.stringify({type: 'synchronized', gameId: gameId, player: 2}));
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
