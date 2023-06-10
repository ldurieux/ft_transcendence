import { WebSocketServer } from "@nestjs/websockets";
import * as WebSocket from 'ws';
import { WebSocketGateway } from '@nestjs/websockets';
import { GameGateway } from "./game/game.gateway";

@WebSocketGateway(3001, { 
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
        this.clients.set(client.toString(), client);
    }

    handleDisconnect(client: WebSocket) {
        console.log('Client disconnected');
        this.clients.delete(client.toString());
    }
}
