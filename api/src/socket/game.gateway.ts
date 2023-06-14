import { MessageBody, SubscribeMessage, WebSocketGateway, ConnectedSocket } from '@nestjs/websockets';
import { Inject, UseGuards, Injectable, ValidationPipe } from '@nestjs/common';
import { SocketGuard } from 'src/auth/auth.guard';
import { SocketServer } from './socket.server'; 
import { UserService } from 'src/user/user.service';
import { GameService } from 'src/game/game.service';
import { send } from 'process';
import { Deque } from 'double-ended-queue';
import { In, W } from 'typeorm';
import { response } from 'express';

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

@WebSocketGateway()
@Injectable()
export class GameGateway {
    constructor(
        @Inject(SocketServer) private socketServer: SocketServer,
        private userService: UserService,
        private gameService: GameService,
    ) {}

    InGame: Set<number>;
    clientWaitingStack: Deque<WebSocket>;

    @UseGuards(SocketGuard)
    @SubscribeMessage('GetFriendList')
    async requestFriendList(@ConnectedSocket() client: WebSocket, id: number) {
        if (this.userService.getUser(id) === null || this.userService.getUser(id) === undefined)
        {
            client.send(JSON.stringify({type: 'Error', Error: "youNotExist"}));
            return;
        }
        if (client.readyState !== client.OPEN) return;
        const friendList = (await this.userService.getUser(id)).friends;
        client.send(JSON.stringify(friendList));
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('gameInvite')
    async gameInvite(@ConnectedSocket() client: WebSocket, @MessageBody( new ValidationPipe()) data: {id: number, friendId: number}) {
        if (client.readyState !== client.OPEN) return;
        if (this.userService.getUser(data.id) === null || this.userService.getUser(data.id) === undefined)
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
        friendSocket.send(JSON.stringify({type: 'gameInvite', id: data.id}));
        client.send(JSON.stringify({type: 'gameInvite', id: data.friendId}));
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('gameInviteResponse')
    async gameInviteResponse(@ConnectedSocket() client: WebSocket, @MessageBody( new ValidationPipe()) data: {id: number, friendId: number, response: boolean}) {
        if (this.userService.getUser(data.id) === null || this.userService.getUser(data.id) === undefined)
        {
            client.send(JSON.stringify({type: 'Error', Error: 'YouNotExist'}));
            return;
        }
        if (client.readyState !== client.OPEN) return;
        const friend = await this.userService.getUser(data.friendId);
        if (!friend)
        {
            client.send(JSON.stringify({type: 'Error', Error: 'friendNotExists'}));
            return;
        }
        const friendSocket = this.socketServer.getSocket(friend.id);
        if (!friendSocket) 
        {
            client.send(JSON.stringify({type: 'Error', Error: 'friendNotOnline'}));
            return;
        }
        client.send(JSON.stringify({type: 'gameInviteResponse', id: data.friendId, response: data.response}));
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('padPosition')
    async receivePadPosition(@ConnectedSocket() client: WebSocket, @MessageBody( new ValidationPipe()) data: {paddleY: number}) {
        const user = await this.userService.getUser(this.socketServer.getId(client));
        this.gameService.updatePadPosition(user, data.paddleY);
    }

    async sendPadPosition(id: number, paddleY: number) {
        const user = await this.userService.getUser(id);
        const client = this.socketServer.getSocket(id);
        if (client.readyState !== client.OPEN)
        {
            this.InGame.delete(id);
            this.gameService.playerDisconnect(user);
            return;
        }
        client.send(JSON.stringify({type: 'padPosition', position: paddleY}));
    }

    async sendBallData( id :number ,ball: {X: number, Y: number, radVector: number, speed: number}) {

        const user = await this.userService.getUser(id);
        const client = this.socketServer.getSocket(id);
        if (client.readyState !== client.OPEN)
        {
            this.InGame.delete(id);
            this.gameService.playerDisconnect(user);
            return;
        }
        client.send(JSON.stringify(ball));
    }

    async sendScoreData(id: number, score: {myScore: number, friendScore: number}) {
        const user = await this.userService.getUser(id);
        const client = this.socketServer.getSocket(id);
        if (client.readyState !== client.OPEN)
        {
            this.InGame.delete(id);
            this.gameService.playerDisconnect(user);
            return;
        }
        client.send(JSON.stringify(score));
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('gameStart')
    async gameStart(@ConnectedSocket() client: WebSocket, @MessageBody( new ValidationPipe()) data: {id: number, friendId: number}) {
        const user = await this.userService.getUser(data.id);
        if (!user || user === undefined)
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
            this.InGame.delete(friend.id);
            return;
        }

        this.InGame.add(data.id);
        this.InGame.add(data.friendId);

        this.gameService.PongGame(user, friend);
    }
}