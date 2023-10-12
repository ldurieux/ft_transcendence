import { SocketServer } from "./socket.server";
import { WebSocketGateway } from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';

import { UserService } from "src/user/user.service";

import { GameGateway } from "src/gameSocket/game.gateway";

@WebSocketGateway()
@Injectable()
export class GameReply {

    async wait(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }

    private DeluxeMatchMaikng: Array<number>;
    private ClassicMatchMaking: Array<number>;
    private inviteMap: Map<number, InviteData>;
    private invitedClients: Map<number, number>;
    private readonly inviteTimeout: number = 30;


    constructor(
        private readonly userService: UserService,
        private socketServer: SocketServer,
        private readonly gameGateway: GameGateway,
    ){
        this.DeluxeMatchMaikng = new Array<number>();
        this.ClassicMatchMaking = new Array<number>();
        this.inviteMap = new Map<number, InviteData>();
        this.invitedClients = new Map<number, number>();
    }

    async sendNotConnected(id: number)
    {
        const socket = await this.socketServer.getSocket(id);
        if (socket !== null)
            socket.send(JSON.stringify({type: 'notConnected'}));
    }

    async invite(id: number, friendId: number, typeOfGame: number)
    {
        const socket: WebSocket = await this.socketServer.getSocket(friendId);

        if (socket === null)
        {
            this.sendNotConnected(id);
            return;
        }
        if (await this.gameGateway.isInGame(friendId))
        {
            this.sendInGame(id);
            return;
        }
        if (await this.gameGateway.isInGame(id))
            this.currentlyInGame(id);
        if (this.invitedClients.has(friendId))
        {
            this.inviteRefused(id, friendId);
            return;
        }
        if (this.ClassicMatchMaking.includes(id))
            this.ClassicMatchMaking.pop();
        if (this.DeluxeMatchMaikng.includes(id))
            this.DeluxeMatchMaikng.pop();
        this.inviteMap.delete(id);
        if (socket !== null)
            socket.send(JSON.stringify({type: 'invite', user: (await this.userService.getUser(id)).display_name, typeOfGame: typeOfGame, id: id}));
        this.inviteMap.set(id, {friendId: friendId, id: id, response: false, typeOfGame: typeOfGame, accepted: false});
        this.invitedClients.set(friendId, id);
        this.inviteWaiting(id);
    }

    async inviteWaiting(id)
    {
        var InviteData: InviteData = this.inviteMap.get(id);
        let waiting:number = 0;
        while (InviteData !== undefined && waiting < this.inviteTimeout && InviteData.response === false)
        {
            InviteData = this.inviteMap.get(id);
            await this.wait(1000);
            waiting++;
        }
        if (waiting >= this.inviteTimeout && InviteData !== undefined)
        {
            const socket = await this.socketServer.getSocket(InviteData.friendId);
            if (socket !== null)
                socket.send(JSON.stringify({type: 'inviteTimeout'}));
            const socket2 = await this.socketServer.getSocket(InviteData.id);
            if (socket2 !== null)
                socket2.send(JSON.stringify({type: 'inviteTimeout'}));
            this.invitedClients.delete(InviteData.friendId);
            this.inviteMap.delete(InviteData.id);
            return;
        }
        else if (InviteData !== undefined)
        {
            this.invitedClients.delete(InviteData.friendId);
            this.inviteMap.delete(InviteData.id);
        }
    }


    async inviteResponse(id: number, response: boolean)
    {
        var InviteData = this.inviteMap.get(id);
        if (InviteData === undefined)
            return;
        InviteData.response = true;
        InviteData.accepted = response;

        if (response === false)
            await this.inviteRefused(id, this.inviteMap.get(id).friendId);
        else 
            await this.gameStart(id, this.inviteMap.get(id).friendId, this.inviteMap.get(id).typeOfGame);
        this.invitedClients.delete(InviteData.friendId);
        this.inviteMap.delete(InviteData.id);
    }

    async sendInGame(id: number)
    {
        const socket = await this.socketServer.getSocket(id);
        if (socket)
            socket.send(JSON.stringify({type: 'InGame'}));
    }

    async currentlyInGame(id: number)
    {
        const socket = await this.socketServer.getSocket(id);
        if (socket)
            socket.send(JSON.stringify({type: 'currentlyInGame'}));
    }

    async MatchMaking(id: number, typeOfGame: number)
    {
        console.log('MatchMaking');

        if (await this.gameGateway.isInGame(id))
        {
            console.log('currentlyInGame');
            this.currentlyInGame(id);
            return;
        }
        var socket: any = null;
        this.inviteResponse(id, false);
        if (this.invitedClients.has(id))
        {
            const truc = this.invitedClients.get(id);
            this.inviteResponse(truc, false);
        }
        if (typeOfGame === 1)
        {
            if (this.ClassicMatchMaking.length)
                socket = await this.socketServer.getSocket(this.ClassicMatchMaking[0]);
            if (this.DeluxeMatchMaikng.includes(id))
                this.DeluxeMatchMaikng.pop();
            if (this.ClassicMatchMaking.includes(id))
                this.ClassicMatchMaking.pop();
            if (socket === null || socket === undefined)
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
            if (this.DeluxeMatchMaikng.length)
                socket = await this.socketServer.getSocket(this.DeluxeMatchMaikng[0]);
            if (this.ClassicMatchMaking.includes(id))
                this.ClassicMatchMaking.pop();
            if (this.DeluxeMatchMaikng.includes(id))
                this.DeluxeMatchMaikng.pop();
            if (socket === null || socket === undefined)
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
        const friendSocket: any = await this.socketServer.getSocket(friendId);
        const socket: any = await this.socketServer.getSocket(id);
        this.inviteMap.delete(id);
        if (friendSocket !== null)
            friendSocket.send(JSON.stringify({type: 'inviteRefused', user : this.userService.getUser(id)}));
        if (socket !== null)
            socket.send(JSON.stringify({type: 'inviteRefused', user : this.userService.getUser(friendId)}));
    }

    async gameStart(Id1: number, Id2: number, typeOfGame: number)
    {
        const friendSocket: any = await this.socketServer.getSocket(Id1);
        const socket: any = await this.socketServer.getSocket(Id2);
        if (friendSocket == null  || socket == null)
            return;
        console.log('gameStart');
        friendSocket.send(JSON.stringify({type: 'gameStart', user : this.userService.getUser(Id1)}));
        socket.send(JSON.stringify({type: 'gameStart', user : this.userService.getUser(Id2)}));
        this.gameGateway.createGame(Id1, Id2, typeOfGame);
    }
}

interface InviteData {
    friendId: number;
    id: number;
    response: boolean;
    typeOfGame: number;
    accepted: boolean;
}