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
    private InGame: Set<number>;

    constructor(
        private readonly userService: UserService,
        private socketServer: SocketServer,
        private readonly gameGateway: GameGateway,
    ){
        this.DeluxeMatchMaikng = new Array<number>();
        this.ClassicMatchMaking = new Array<number>();
        this.InGame = new Set<number>();
    }


    async invite(type: string, id: number, user: User)
    {
        const socket: WebSocket = this.socketServer.getSocket(id);
        if (!socket)
            return;
        if (this.InGame.has(id))
        {
            this.sendInGame(id);
            return;
        }
        socket.send(JSON.stringify(user));
    }

    async sendInGame(id: number)
    {
        const socket = await this.socketServer.getSocket(id);
        socket.send(JSON.stringify({type: 'InGame'}));
    }

    async MatchMaking(id: number, typeOfGame: number)
    {
        console.log('MatchMaking');
        if (typeOfGame === 1)
        {
            if (this.DeluxeMatchMaikng[0] === id)
                this.DeluxeMatchMaikng.pop();
            if (this.ClassicMatchMaking[0] === id)
                this.ClassicMatchMaking.pop();
            this.ClassicMatchMaking.push(id);
            if (this.ClassicMatchMaking.length === 2)
            {
                console.log('gameStart');
                this.gameStart(this.ClassicMatchMaking[0], this.ClassicMatchMaking[1]);
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
                console.log('gameStart');
                this.gameStart(this.DeluxeMatchMaikng[0], this.DeluxeMatchMaikng[1]);
                this.DeluxeMatchMaikng.splice(0, 2);
            }
        }
    }

    async inviteRefused(id: number, friendId: number) {
        const friendSocket: WebSocket = this.socketServer.getSocket(friendId);
        const socket: WebSocket = this.socketServer.getSocket(id);
        if (friendSocket)
            friendSocket.send(JSON.stringify({type: 'inviteRefused', user : this.userService.getUser(id)}));
        if (socket)
            socket.send(JSON.stringify({type: 'inviteRefused', user : this.userService.getUser(friendId)}));
    }

    async gameStart(Id1: number, Id2: number)
    {
        console.log('gameStart');
        const friendSocket: WebSocket = this.socketServer.getSocket(Id1);
        const socket: WebSocket = this.socketServer.getSocket(Id2);
        if (friendSocket == null || socket == null)
            return;
        console.log('gameStart');
        this.InGame.add(Id1);
        this.InGame.add(Id2);
        friendSocket.send(JSON.stringify({type: 'gameStart', user : this.userService.getUser(Id1)}));
        socket.send(JSON.stringify({type: 'gameStart', user : this.userService.getUser(Id2)}));
        this.gameGateway.createGame(Id1, Id2, 1);
    }

    async removeIdInGame(id: number)
    {
        this.InGame.delete(id);
    }
}