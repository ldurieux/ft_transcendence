import { SocketServer, InviteData } from "./socket.server";
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

    private readonly inviteTimeout: number = 30;


    constructor(
        private readonly userService: UserService,
        private socketServer: SocketServer,
        private readonly gameGateway: GameGateway,
    ){
    }

    async sendNotConnected(id: number)
    {
        const socket = await this.socketServer.getSocket(id);
        if (socket !== null)
            socket.send(JSON.stringify({type: 'notConnected'}));
    }

    async checkIds(id: number)
    {
        this.inviteResponse(id, false);
        if (this.socketServer.invitedClients.has(id))
        {
            const truc = this.socketServer.invitedClients.get(id);
            this.inviteResponse(truc, false);
        }
    }

    async isInMatchMaking(id: number)
    {
        if (this.socketServer.ClassicMatchMaking.includes(id))
            return (true);
        if (this.socketServer.DeluxeMatchMaikng.includes(id))
            return (true);
        return (false);
    }

    async invite(id: number, friendId: number, typeOfGame: number)
    {
        const socket: WebSocket = await this.socketServer.getSocket(friendId);
        let user1;
        let user2;

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
        if (this.socketServer.invitedClients.has(friendId))
            return;
        await this.checkIds(id);
        if (await this.gameGateway.isInGame(id))
            this.currentlyInGame(id);
        if (this.socketServer.invitedClients.has(friendId))
            return;
        if (this.socketServer.ClassicMatchMaking.includes(id))
            this.socketServer.ClassicMatchMaking.pop();
        if (this.socketServer.DeluxeMatchMaikng.includes(id))
            this.socketServer.DeluxeMatchMaikng.pop();
        this.socketServer.inviteMap.delete(id);

        try {
            user1 = await this.userService.getUser(id);
            user2 = await this.userService.getUser(friendId);
        }
        catch(e) {
            return;
        }
        if (socket !== null)
            socket.send(JSON.stringify({type: 'invite', user: user1.display_name, typeOfGame: typeOfGame, id: id}));
        this.socketServer.inviteMap.set(id, {friendId: friendId, id: id, name: user2.display_name, response: false, typeOfGame: typeOfGame, accepted: false});
        this.socketServer.invitedClients.set(friendId, id);
        this.inviteWaiting(id);
    }

    async inviteWaiting(id)
    {
        var InviteData: InviteData = this.socketServer.inviteMap.get(id);
        let waiting:number = 0;
        while (InviteData !== undefined && waiting < this.inviteTimeout && InviteData.response === false)
        {
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
            this.socketServer.invitedClients.delete(InviteData.friendId);
            this.socketServer.inviteMap.delete(InviteData.id);
            return;
        }
    }

    async inviteResponse(id: number, response: boolean)
    {
        var InviteData = this.socketServer.inviteMap.get(id);
        if (InviteData === undefined)
            return;
        InviteData.response = true;
        InviteData.accepted = response;

        if (await this.gameGateway.isInGame(id))
        {
            this.sendInGame(id);
            this.socketServer.invitedClients.delete(InviteData.friendId);
            this.socketServer.inviteMap.delete(InviteData.id);
            return;
        }

        if (response === false)
            await this.inviteRefused(id, this.socketServer.inviteMap.get(id).friendId);
        else 
            await this.gameStart(id, this.socketServer.inviteMap.get(id).friendId, this.socketServer.inviteMap.get(id).typeOfGame);
        this.socketServer.invitedClients.delete(InviteData.friendId);
        this.socketServer.inviteMap.delete(InviteData.id);
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
        if (typeOfGame === 0)
        {
            if (this.socketServer.ClassicMatchMaking.includes(id))
                this.socketServer.ClassicMatchMaking.pop();
            if (this.socketServer.DeluxeMatchMaikng.includes(id))
                this.socketServer.DeluxeMatchMaikng.pop();
            return;
        }
        if (await this.gameGateway.isInGame(id))
        {
            this.currentlyInGame(id);
            return;
        }
        var socket: any = null;
        this.checkIds(id);
        if (typeOfGame === 1)
        {
            if (this.socketServer.ClassicMatchMaking.length)
                socket = await this.socketServer.getSocket(this.socketServer.ClassicMatchMaking[0]);
            if (this.socketServer.DeluxeMatchMaikng.includes(id))
                this.socketServer.DeluxeMatchMaikng.pop();
            if (this.socketServer.ClassicMatchMaking.includes(id))
                this.socketServer.ClassicMatchMaking.pop();
            if (socket === null || socket === undefined)
                this.socketServer.ClassicMatchMaking.pop();
            this.socketServer.ClassicMatchMaking.push(id);
            if (this.socketServer.ClassicMatchMaking.length === 2)
            {
                this.gameStart(this.socketServer.ClassicMatchMaking[0], this.socketServer.ClassicMatchMaking[1], typeOfGame);
                this.socketServer.ClassicMatchMaking.splice(0, 2);
            }
        }
        else if (typeOfGame === 2)
        {
            if (this.socketServer.DeluxeMatchMaikng.length)
                socket = await this.socketServer.getSocket(this.socketServer.DeluxeMatchMaikng[0]);
            if (this.socketServer.ClassicMatchMaking.includes(id))
                this.socketServer.ClassicMatchMaking.pop();
            if (this.socketServer.DeluxeMatchMaikng.includes(id))
                this.socketServer.DeluxeMatchMaikng.pop();
            if (socket === null || socket === undefined)
                this.socketServer.DeluxeMatchMaikng.pop();
            this.socketServer.DeluxeMatchMaikng.push(id);
            if (this.socketServer.DeluxeMatchMaikng.length === 2)
            {
                this.gameStart(this.socketServer.DeluxeMatchMaikng[0], this.socketServer.DeluxeMatchMaikng[1], typeOfGame);
                this.socketServer.DeluxeMatchMaikng.splice(0, 2);
            }
        }
    }

    async inviteRefused(id: number, friendId: number) {
        const friendSocket: any = await this.socketServer.getSocket(friendId);
        const socket: any = await this.socketServer.getSocket(id);
        let user1;
        let user2;
        this.socketServer.inviteMap.delete(id);
        try {
            user1 = await this.userService.getUser(id);
            user2 = await this.userService.getUser(friendId);
        }
        catch(e) {
            return;
        }
        if (friendSocket !== null)
            friendSocket.send(JSON.stringify({type: 'inviteRefused', user : user1}));
        if (socket !== null)
            socket.send(JSON.stringify({type: 'inviteRefused', user : user2}));
    }

    async gameStart(Id1: number, Id2: number, typeOfGame: number)
    {
        const friendSocket: any = await this.socketServer.getSocket(Id1);
        const socket: any = await this.socketServer.getSocket(Id2);
        let user1;
        let user2;
        try {
            user1 = await this.userService.getUser(Id1);
            user2 = await this.userService.getUser(Id2);
        }
        catch (e)
        {
            return;
        }
        if (friendSocket == null  || socket == null)
            return;
        friendSocket.send(JSON.stringify({type: 'gameStart', user : user1}));
        socket.send(JSON.stringify({type: 'gameStart', user : user2}));
        this.gameGateway.createGame(Id1, Id2, typeOfGame);
    }
}
