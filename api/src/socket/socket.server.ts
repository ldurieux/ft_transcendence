import * as WebSocket from 'ws';
import { OnGatewayConnection, OnGatewayDisconnect, MessageBody, OnGatewayInit ,SubscribeMessage, WebSocketGateway, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';

@WebSocketGateway({ 
    transports: ['websocket']
})
export class SocketServer implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(
    ) {}
    @WebSocketServer() server: WebSocket;

    afterInit(server: WebSocket) {
        // console.log('Init');
    }

    handleConnection(client: WebSocket) {
        client.data = {}
        console.log('Client isConnected');
        console.log(client.toString());
    }

    handleDisconnect(client: WebSocket) {
        console.log('Client disconnected');
    }

    getServer() {
        return this.server;
    }
}
