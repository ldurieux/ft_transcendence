import { MessageBody, SubscribeMessage, WebSocketGateway, ConnectedSocket } from '@nestjs/websockets';
import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Inject, UseGuards, Injectable } from '@nestjs/common';
import { SocketGuard } from 'src/auth/auth.guard';
import { SocketServer } from './socket.server'; 

@WebSocketGateway()
@Injectable()
export class GameGateway {
    constructor(
        @Inject(SocketServer) private socketServer: SocketServer,
    ) {}

    @UseGuards(SocketGuard)
    @SubscribeMessage('message')
    async handleMessage(@MessageBody() data: string, @ConnectedSocket() client) {
    }
}