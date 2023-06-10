import * as WebSocket from 'ws';
import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';

import { UserService } from 'src/user/user.service';
import { GameService } from '../game/game.service';
import { AuthService } from '../auth/auth.service';
import { SocketGuard } from './socket.service';


@WebSocketGateway(3001, {
    namespace: '/game',
    transport: ['websocket']
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
    @WebSocketServer() server: WebSocket;

    constructor(
        private userService: UserService,
        private gameService: GameService,
        private authService: AuthService
    ) {}

    afterInit(server: WebSocket) {
        console.log('Init');
    }

    handleConnection(client: WebSocket) {
        console.log('Client isConnected');
    }
    handleDisconnect(client: WebSocket) {
        console.log('Client disconnected');
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('dataPongPad')
    onEvent(client: WebSocket, data: any) {
        console.log('Client message', data);
    }
}
