import { MessageBody, SubscribeMessage, WebSocketGateway, ConnectedSocket } from '@nestjs/websockets';
import { Inject, UseGuards, Injectable, ValidationPipe, forwardRef } from '@nestjs/common';

import { SocketGuard } from 'src/auth/auth.guard';
import { SocketServer } from './socket.server'; 
import { WebSocket } from 'ws';
import { UserService } from 'src/user/user.service';
import { GameService } from 'src/game/game.service';

import { User } from 'src/user/user.entity';

import { Deque } from 'double-ended-queue';

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

interface GameData {
    playerId: PlayerId;
    ball: Ball;
    paddle1: Paddle;
    paddle2: Paddle;
    score: Score;
    screen: GameScreen;
}

interface WaitingPlayer {
    id: number;
    socket: WebSocket;
}

@WebSocketGateway()
@Injectable()
export class GameGateway {
    constructor(
        private socketServer: SocketServer,
        private userService: UserService,
        @Inject(forwardRef(() => GameService))
        private gameService: GameService,
    ) {}

    InGame: Set<number>;
    clientWaitingStack: Deque<WaitingPlayer>;

    @UseGuards(SocketGuard)
    @SubscribeMessage('friendList')
    async requestFriendList(@ConnectedSocket() client: WebSocket, id: number) {
        this.userService.getUser(id);
        if (client.readyState !== client.OPEN) return;
        const friendList = (await this.userService.getUser(id)).friends;
        client.send(JSON.stringify(friendList));
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('MatchMaking')
    async matchMaking(@ConnectedSocket() client: WebSocket, data: {id: number}) {
        this.userService.getUser(data.id);
        if (this.clientWaitingStack.length() === 0)
        {
            this.clientWaitingStack.push({id: data.id, socket: client});
            return;
        }
        const friend: WaitingPlayer = this.clientWaitingStack.pop();
        if (friend.socket.readyState !== friend.socket.OPEN)
        {
            this.clientWaitingStack.push({id: data.id, socket: client});
            return;
        }
        friend.socket.send(JSON.stringify({type: 'MatchMaking', id: data.id}));
        client.send(JSON.stringify({type: 'MatchMaking', id: friend.id}));
        this.gameStart(friend.id, data.id);
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('gameInvite')
    async gameInvite(@ConnectedSocket() client: WebSocket, @MessageBody( new ValidationPipe()) data: {id: number, friendId: number}) {
        const user: User = await this.userService.getUser(data.id);
        if (user === null || user === undefined)
        {
            client.send(JSON.stringify({type: 'Error', Error: 'YouNotExist'}));
            return;
        }
        const friend = await this.userService.getUser(data.friendId);
        if (!friend)
        {
            client.send(JSON.stringify({type: 'Error', Error: 'FriendNotExists'}));
            return;
        }
        const friendSocket = this.socketServer.getSocket(friend.id);
        if (!friendSocket) 
        {
            client.send(JSON.stringify({type: 'Error', Error: 'FriendNotOnline'}));
            return;
        }
        if (this.InGame.has(data.friendId))
        {
            client.send(JSON.stringify({type: 'Error', Error: 'FriendInGame'}));
            return;
        }
        friendSocket.send(JSON.stringify({type: 'gameInvite', id: data.id, friendId: data.friendId, whoInvit: user}));
        client.send(JSON.stringify({type: 'gameInvite', id: data.friendId, friendId: data.id}));
    }

    async gameInviteResponse(data: {id: number, friendId: number, response: boolean}) {
        const friend = await this.userService.getUser(data.friendId);
        const friendSocket = this.socketServer.getSocket(friend.id);
        const clientSocket = this.socketServer.getSocket(data.id);  
        if (clientSocket.readyState !== clientSocket.OPEN)
            return;
        if (friendSocket.readyState !== friendSocket.OPEN)
        {
            clientSocket.send(JSON.stringify({type: 'Error', Error: 'FriendNotOnline'}));
            return;
        }
        if (data.response == false)
        {
            friendSocket.send(JSON.stringify({type: 'gameInviteResponse', response: false}));
            return;
        }
        this.gameStart(data.id, data.friendId);
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('padPosition')
    async receivePadPosition(@ConnectedSocket() client: WebSocket, @MessageBody( new ValidationPipe()) data: {paddleY: number}) {
        const user = await this.userService.getUser(this.socketServer.getId(client));
        this.gameService.updatePadPosition(user.id, data.paddleY);
    }

    async sendPadPosition(id: number, paddleY: number, screen: GameScreen) {
        const client = this.socketServer.getSocket(id);
        if (client.readyState !== client.OPEN)
        {
            this.gameService.playerDisconnect(id);
            return;
        }
        client.send(JSON.stringify({type: 'padPosition', position: paddleY, screen: screen}));
    }

    async sendBallData(gameData: GameData) {

        const client1 = this.socketServer.getSocket(gameData.playerId.player1Id);
        const client2 = this.socketServer.getSocket(gameData.playerId.player2Id);
        if (client1.readyState !== client1.OPEN)
        {
            this.gameService.playerDisconnect(gameData.playerId.player1Id);
            return;
        }
        if (client2.readyState !== client2.OPEN)
        {
            this.gameService.playerDisconnect(gameData.playerId.player2Id);
            return;
        }
        client1.send(JSON.stringify({type: 'ballData', ball: gameData.ball, screen: gameData.screen}));
        client2.send(JSON.stringify({type: 'ballData', ball: gameData.ball, screen: gameData.screen}));
    }

    async sendScoreData(gameData: GameData) {
        const client1 = this.socketServer.getSocket(gameData.playerId.player1Id);
        const client2 = this.socketServer.getSocket(gameData.playerId.player2Id);
        if (client1.readyState !== client1.OPEN)
        {
            this.gameService.playerDisconnect(gameData.playerId.player1Id);
            return;
        }
        if (client2.readyState !== client2.OPEN)
        {
            this.gameService.playerDisconnect(gameData.playerId.player2Id);
            return;
        }
        client1.send(JSON.stringify({type: 'scoreData', score: gameData.score}));
        client2.send(JSON.stringify({type: 'scoreData', score: gameData.score}));
    }

    async gameStart(id: number, friendId: number) {
        this.InGame.add(id);
        this.InGame.add(friendId);
        this.gameService.PongGame(id, friendId);
    }

    async endGame(winner: number, loser: number, disconnect: boolean = false) {
        this.InGame.delete(winner);
        this.InGame.delete(loser);
        const winnerSocket = this.socketServer.getSocket(winner);
        const loserSocket = this.socketServer.getSocket(loser);
        if (disconnect)
        {
            if (winnerSocket.readyState === winnerSocket.OPEN)
                winnerSocket.send(JSON.stringify({type: 'gameEnd', win: true, disconnect: true}));
        }
        else
        {
            if (winnerSocket.readyState === winnerSocket.OPEN)
                winnerSocket.send(JSON.stringify({type: 'gameEnd', win: true, disconnect: false}));
            if (loserSocket.readyState === loserSocket.OPEN)
                loserSocket.send(JSON.stringify({type: 'gameEnd', win: false, disconnect: false}));
        }
    }

    async sendData(GameData: GameData) {
        const socket1 = this.socketServer.getSocket(GameData.playerId.player1Id);
        const socket2 = this.socketServer.getSocket(GameData.playerId.player2Id);
        if (socket1.readyState !== socket1.OPEN)
        {
            this.gameService.playerDisconnect(GameData.playerId.player1Id);
            return;
        }
        if (socket2.readyState !== socket2.OPEN)
        {
            this.gameService.playerDisconnect(GameData.playerId.player2Id);
            return;
        }
        socket1.send(JSON.stringify({type: 'gameData', data: GameData}));
        socket2.send(JSON.stringify({type: 'gameData', data: GameData}));
    }

    async delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }

    async synchronizePlayer(gameData: GameData)
    {
        const client1 = this.socketServer.getSocket(gameData.playerId.player1Id);
        const client2 = this.socketServer.getSocket(gameData.playerId.player2Id);
        await this.delay(3000);
        client1.send({type: "start"});
        client2.send({type: "start"});
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('userStatus')
    async takeUserStatus(client: WebSocket, id: number) {
        if (this.InGame.has(id))
        {
            client.send(JSON.stringify({type: 'userStatus', status: 'InGame'}));
        }
        else
        {
            client.send(JSON.stringify({type: 'userStatus', status: 'Available'}));
        }
    }
}