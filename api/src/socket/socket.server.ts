import { WebSocketServer } from "@nestjs/websockets";
import * as WebSocket from 'ws';
import { WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway({ 
    transports: ['websocket']
})
export class SocketServer {
    constructor(
    ) {}
    @WebSocketServer() server: WebSocket;
    clients: Map<string, WebSocket> = new Map();

    afterInit(server: WebSocket) {
        console.log('Init');
    }

    handleConnection(client: WebSocket) {
        console.log('Client isConnected');
        console.log(client);
        this.clients.set(client.toString(), client);
    }

    handleDisconnect(client: WebSocket) {
        console.log('Client disconnected');
        this.clients.delete(client.toString());
    }

    getServer() {
        return this.server;
    }

    getClients() {
        return this.clients;
    }
}
