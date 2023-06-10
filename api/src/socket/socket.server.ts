import * as WebSocket from 'ws';
import { OnGatewayConnection, OnGatewayDisconnect, MessageBody, OnGatewayInit ,SubscribeMessage, WebSocketGateway, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';

@WebSocketGateway({ 
    transports: ['websocket']
})
export class SocketServer implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(
    ) {}
    @WebSocketServer() server: WebSocket;
    clients: Map<string, WebSocket> = new Map();

    afterInit(server: WebSocket) {
        // console.log('Init');
    }

    handleConnection(client: WebSocket) {
        console.log('Client isConnected');
        console.log(client.toString());
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
