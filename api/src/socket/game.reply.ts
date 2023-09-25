import { SocketServer } from "./socket.server";
import { WebSocketGateway } from '@nestjs/websockets';
import { Inject, Injectable } from '@nestjs/common';
// import {}

import { User } from "src/user/user.entity";

import { UserService } from "src/user/user.service";

import { GameGateway } from "src/gameSocket/game.gateway";

@WebSocketGateway()
@Injectable()
export class GameReply {

    private DeluxeMatchMaikng: Array<number>;
    private ClassicMatchMaking: Array<number>;

    constructor(
        private readonly userService: UserService,
        private socketServer: SocketServer,
        private readonly gameGateway: GameGateway,
    ){
        this.DeluxeMatchMaikng = new Array<number>();
        this.ClassicMatchMaking = new Array<number>();
    }

    async sendNotConnected(id: number)
    {
        const socket = await this.socketServer.getSocket(id);
        if (socket)
            socket.send(JSON.stringify({type: 'notConnected'}));
    }

    async invite(id: number, friendId: number, typeOfGame: number)
    {
        const socket: WebSocket = await this.socketServer.getSocket(friendId);

        if (socket === null || socket === undefined)
        {
            this.sendNotConnected(id);
            return;
        }
        if (await this.gameGateway.isInGame(friendId))
        {
            this.sendInGame(id);
            return;
        }
        socket.send(JSON.stringify({type: 'invite', user: (await this.userService.getUser(id)).display_name, typeOfGame: typeOfGame}));
    }

    async sendInGame(id: number)
    {
        const socket = await this.socketServer.getSocket(id);
        if (socket)
            socket.send(JSON.stringify({type: 'InGame'}));
    }

    async MatchMaking(id: number, typeOfGame: number)
    {
        if (typeOfGame === 1)
        {
            if (this.DeluxeMatchMaikng[0] === id)
                this.DeluxeMatchMaikng.pop();
            if (this.ClassicMatchMaking[0] === id)
                this.ClassicMatchMaking.pop();
            this.ClassicMatchMaking.push(id);
            if (this.ClassicMatchMaking.length === 2)
            {
                this.gameStart(this.ClassicMatchMaking[0], this.ClassicMatchMaking[1], typeOfGame);
                this.ClassicMatchMaking.splice(0, 2);
            }
        }
        else if (typeOfGame === 2)
        {
            if (this.ClassicMatchMaking[0] === id)
                this.ClassicMatchMaking.pop();
            if (this.DeluxeMatchMaikng[0] === id)
                this.DeluxeMatchMaikng.pop();
            this.DeluxeMatchMaikng.push(id);
            if (this.DeluxeMatchMaikng.length === 2)
            {
                this.gameStart(this.DeluxeMatchMaikng[0], this.DeluxeMatchMaikng[1], typeOfGame);
                this.DeluxeMatchMaikng.splice(0, 2);
            }
        }
    }

    async inviteRefused(id: number, friendId: number) {
        const friendSocket: WebSocket = await this.socketServer.getSocket(friendId);
        const socket: WebSocket = await this.socketServer.getSocket(id);
        if (friendSocket)
            friendSocket.send(JSON.stringify({type: 'inviteRefused', user : this.userService.getUser(id)}));
        if (socket)
            socket.send(JSON.stringify({type: 'inviteRefused', user : this.userService.getUser(friendId)}));
    }

    async gameStart(Id1: number, Id2: number, typeOfGame: number)
    {
        console.log('gameStart');
        const friendSocket: WebSocket = await this.socketServer.getSocket(Id1);
        const socket: WebSocket = await this.socketServer.getSocket(Id2);
        if (friendSocket == null || socket == null)
            return;
        console.log('gameStart');
        friendSocket.send(JSON.stringify({type: 'gameStart', user : this.userService.getUser(Id1)}));
        socket.send(JSON.stringify({type: 'gameStart', user : this.userService.getUser(Id2)}));
        this.gameGateway.createGame(Id1, Id2, typeOfGame);
    }
}