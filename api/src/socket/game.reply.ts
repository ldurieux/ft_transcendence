import { SocketServer } from "./socket.server";
import { WebSocketGateway } from '@nestjs/websockets';
import { Inject, Injectable } from '@nestjs/common';

import { User } from "src/user/user.entity";

import { Deque } from 'double-ended-queue';

import { UserService } from "src/user/user.service";

import * as gameInterface from "src/game/gameInterface";

@WebSocketGateway()
@Injectable()
export class GameReply {
    constructor(
        private readonly userService: UserService,
        private socketServer: SocketServer,
    ){}

    private matchMakingStack: Deque<number>;
    private InGame: Set<number>;
    private WaitingPlayerMap: Map<gameInterface.PlayerId, gameInterface.playersWithReady>;
    private waitingMatchMakingResponse: Map<number, number>;

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

    async MatchMaking(id: number)
    {
        if (this.matchMakingStack.length() === 0)
        {
            this.matchMakingStack.push({id});
        }
        else
        {
            const friend: number = this.matchMakingStack.pop();
            if (this.InGame.has(friend))
            {   
                this.matchMakingStack.push({id});
                return;
            }
            if (this.socketServer.getSocket(friend) === null)
            {
                this.matchMakingStack.push({id});
                return;
            }
            const type: string = 'matchMakingInvite';
            this.invite(type, friend, await this.userService.getUser(id));
            this.invite(type, id, await this.userService.getUser(friend));
            const players: gameInterface.PlayerId = {player1Id: id, player2Id: friend};
            const playerData: gameInterface.playersWithReady = {Players: players, Ready: {player1Ready: false, player2Ready: false}};
            this.WaitingPlayerMap.set(players, playerData);
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

    async matchMakingInviteRefused(id: number, friendId: number) {
        const friendSocket: WebSocket = this.socketServer.getSocket(friendId);
        const socket: WebSocket = this.socketServer.getSocket(id);
        if (friendSocket)
        {
            friendSocket.send(JSON.stringify({type: 'matchMakingInviteRefused', user : this.userService.getUser(id)}));
            this.matchMakingStack.push({friendId});
        }
        if (socket)
        {
            socket.send(JSON.stringify({type: 'matchMakingInviteRefused', user : this.userService.getUser(friendId)}));
            this.matchMakingStack.push({id});
        }
    }

    async gameStart(friendId: number, id: number)
    {
        this.InGame.add(friendId);
        this.InGame.add(id);
        const friendSocket: WebSocket = this.socketServer.getSocket(friendId);
        const socket: WebSocket = this.socketServer.getSocket(id);
        friendSocket.send(JSON.stringify({type: 'gameStart', user : this.userService.getUser(id)}));
        socket.send(JSON.stringify({type: 'gameStart', user : this.userService.getUser(friendId)}));
    }

    async removeIdInGame(id: number)
    {
        this.InGame.delete(id);
    }

    async getPlayerMapValue(id: number): Promise<gameInterface.playersWithReady | null> {
        for (const [key, value] of this.WaitingPlayerMap.entries()) {
            if (key.player1Id === id)
            {
                return (value);
            }
            else if (key.player2Id === id)
            {
                return (value);
            }
        }
        return (null);
    }

    async removePlayerMapValue(id: number)
    {
        for (const [key] of this.WaitingPlayerMap.entries()) {
            if (key.player1Id === id)
            {
                this.WaitingPlayerMap.delete(key);
                return;
            }
            else if (key.player2Id === id)
            {
                this.WaitingPlayerMap.delete(key);
                return;
            }
        }
    }

    async removeMatchMakingStack(id: number)
    {
        for (let i = 0; i < this.matchMakingStack.length; i++)
        {
            if (this.matchMakingStack.get(i).id === id)
            {
                this.matchMakingStack.remove(i);
                return;
            }
        }
    }
}