import { MessageBody, SubscribeMessage, WebSocketGateway, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Inject, UseGuards, Injectable } from '@nestjs/common';
import { SocketGuard } from 'src/auth/auth.guard';
import { SocketServer } from './socket.server'; 

@WebSocketGateway()
@Injectable()
export class ChatGateway {
    constructor( 
        @Inject(SocketServer) private socketServer: SocketServer,
    ) {}

    @UseGuards(SocketGuard)
    async sendTo(to: number, data: object) {
        const raw = JSON.stringify(data)
        for (const client of this.socketServer.getClients()) {
            if (client[1].socket.data == to)
                client[1].socket.send(raw)
        }
    }
}