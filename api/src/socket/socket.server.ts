import * as WebSocket from 'ws';
import { OnGatewayConnection, OnGatewayDisconnect, MessageBody, OnGatewayInit ,SubscribeMessage, WebSocketGateway, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

export interface InviteData {
    friendId: number;
    id: number;
    name: string;
    response: boolean;
    typeOfGame: number;
    accepted: boolean;
}

@Injectable()
@WebSocketGateway({ 
    transports: ['websocket']
})
export class SocketServer implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    public DeluxeMatchMaikng: Array<number>;
    public ClassicMatchMaking: Array<number>;
    public inviteMap: Map<number, InviteData>;
    public invitedClients: Map<number, number>;
    public focusOn: Map<number, WebSocket>;

    private inGameList: Set<number>;

    constructor(
        private jwtService: JwtService,
    ) {
        this.DeluxeMatchMaikng = new Array<number>();
        this.ClassicMatchMaking = new Array<number>();
        this.inviteMap = new Map<number, InviteData>();
        this.invitedClients = new Map<number, number>();
        this.inGameList = new Set<number>();
        this.focusOn = new Map<number, WebSocket>();
    }

    @WebSocketServer() server: WebSocket;
    static serverRef;

    async afterInit(server: WebSocket) {}

    async handleConnection(client: WebSocket) {
        client.data = {}
        client.data.isInGame = false;
    }
    
    @SubscribeMessage('auth')
    async handleAuth(@ConnectedSocket() client: WebSocket, @MessageBody('data') authHeader: any) {
        SocketServer.serverRef = this.server;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            client.terminate();
            return;
        }

        const token = authHeader.split(' ')[1];
        if (typeof token !== 'string' || token == "null") {
            client.terminate();
            return;
        }

        try {
          const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
          const { id } = payload;

          client.data.user = id;
        } catch (err) {
            client.terminate();
            return;
        }

        if (this.invitedClients.has(client.data.user))
        {
            const truc = this.invitedClients.get(client.data.user);
            const socket = await this.getSocket(client.data.user);
            const truc1 = this.inviteMap.get(truc);
            socket.send(JSON.stringify({type: 'invite', user: truc1.name, typeOfGame: truc1.typeOfGame, id: truc1.id}));
        }

        this.focusOn.set(client.data.user, client);
        await this.setClientData()
        this.broadcast(client.data.user, { event: "connect", data: { user: client.data } })

        for (const other of this.server.clients) {
            if (other.data.user == null || other.data.user == undefined)
                continue;

            const raw = JSON.stringify({ event: "connect", data: { user: other.data } })
            if (other.data.user != client.data.user)
                client.send(raw)
        }
    }

    @SubscribeMessage("focusOn")
    async handleFocusOn(@ConnectedSocket() client: WebSocket) {
        const id = this.getId(client);
        console.log("focusOn: ");
        if (id == null || id == undefined)
            return;
        this.focusOn.set(id, client);
    }

    async broadcast(from: number, data: any) {
        const raw = JSON.stringify(data)

        for (const client of this.server.clients) {
            if (client.data.user == null || client.data.user == undefined)
                continue;

            if (client.data.user != from)
                client.send(raw)
        }
    }

    async sendClientsToAll(from: number): Promise<boolean>{
        await this.setClientData();
        const me = await this.getSocket(from);
        if (me == null)
            return(false);
        if (me.data == null || me.data == undefined)
            return (false);
        const raw = JSON.stringify({ event: "connect", data: { user: me.data } })
        for (const client of this.server.clients) {
            if (client.data.user == null || client.data.user == undefined)
                continue;

            if (client.data.user != from)
                client.send(raw)
        }
        return (true);
    }

    async addToInGameList(id: number)
    {
        this.inGameList.add(id);
    }

    async isInGame(id: number)
    {
        return this.inGameList.has(id);
    }

    async removeFromInGameList(id: number)
    {
        this.inGameList.delete(id);
    }

    async setClientData()
    {
        for (const client of this.server.clients) {
            if (client.data.user == null || client.data.user == undefined)
                continue;

            client.data.isInGame = this.inGameList.has(client.data.user);
        }
    }

    async handleDisconnect(client: WebSocket) {
        if (client.data.user != null && client.data.user != undefined)
            this.broadcast(client.data.user, { event: "disconnect", data: { user: client.data.user } })
        if (this.focusOn.get(client.data.user) == client)
            this.focusOn.delete(client.data.user);
    }

    static instance() {
        return this.serverRef;
    }

    getServer() {
        return this.server;
    }

    async getSocket(id: number) {
        for (const client of this.server.clients) {
            if (client.data.user == id) {
                return client;
            }
        }
        return null;
    }

    getId(client: WebSocket) {
        return client.data.user;
    }
}
