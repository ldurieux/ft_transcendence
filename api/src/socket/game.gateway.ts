import { MessageBody, SubscribeMessage, WebSocketGateway, ConnectedSocket } from '@nestjs/websockets';
import { Inject, UseGuards, Injectable, ValidationPipe } from '@nestjs/common';
import { SocketGuard } from 'src/auth/auth.guard';
import { SocketServer } from './socket.server'; 
import { UserService } from 'src/user/user.service';
import { GameService } from 'src/game/game.service';

@WebSocketGateway()
@Injectable()
export class GameGateway {
    constructor(
        @Inject(SocketServer) private socketServer: SocketServer,
        private userService: UserService,
        private gameService: GameService,
    ) {}

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
        if (friendSocket.game.inGame === true)
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
        friendSocket.send(JSON.stringify({type: 'gameInviteResponse', id: data.id, response: data.response}));
        client.send(JSON.stringify({type: 'gameInviteResponse', id: data.friendId, response: data.response}));
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('padPosition')
    async PadPosition(@ConnectedSocket() client: WebSocket, @MessageBody( new ValidationPipe()) data: {id: number, position: number}) {
        if (this.userService.getUser(data.id) === null || this.userService.getUser(data.id) === undefined)
        {
            client.send(JSON.stringify({type: 'Error', Error: 'YouNotExist'}));
            return;
        }
    }

    async sendPadPosition(id: number, position: number) {
        const client = this.socketServer.getSocket(id);
        client.send(JSON.stringify({type: 'padPosition', position: position}));
    }

    async sendPongData( id :number ,data: {ball: {X: number, Y: number, radVector: number, speed: number}, score: {scoreFriend: number, myscore: number}}) {
        const user = await this.userService.getUser(id);
        const client = this.socketServer.getSocket(id);
        if (client.readyState !== client.OPEN)
        {
            user.game.inGame = false;
            this.gameService.playerDisconnect(user);
            return;
        }
        client.send(JSON.stringify(data));
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('gameStart')
    async gameStart(@ConnectedSocket() client: WebSocket, @MessageBody( new ValidationPipe()) data: {id: number, friendId: number, gameType: boolean}) {
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
            friend.game.inGame = false;
            return;
        }
        // if (data.gameType === true)
        this.gameService.startPongGame(user, friend);
        // else
        //     this.gameService.startPongGame(await this.userService.getUser(data.id), null);
    }
}