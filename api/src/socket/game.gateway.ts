import * as WebSocket from 'ws';
import { WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';

import { UserService } from 'src/user/user.service';
import { GameService } from '../game/game.service';
import { AuthService } from '../auth/auth.service';
import { SocketGuard } from './socket.service';


@WebSocketGateway(3001, { transports: ['websocket'] })
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private userService: UserService,
        private gameService: GameService,
        private authService: AuthService
    ) { }

    @UseGuards(SocketGuard)
    @SubscribeMessage('join')
    async join(client: WebSocket, payload: any) {
        const user = await this.userService.findOne(payload.userId);
        const game = await this.gameService.findOne(payload.gameId);
        const player = await this.gameService.addPlayer(game, user);
        const token = await this.authService.generateToken(user);
        const message = { type: 'join', payload: { player, token } };
        client.send(JSON.stringify(message));
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('start')
    async start(client: WebSocket, payload: any) {
        const game = await this.gameService.findOne(payload.gameId);
        const message = { type: 'start', payload: game };
        client.send(JSON.stringify(message));
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('move')
    async move(client: WebSocket, payload: any) {
        const game = await this.gameService.findOne(payload.gameId);
        const message = { type: 'move', payload: game };
        client.send(JSON.stringify(message));
    }

    afterInit(server: any) {
        console.log('Init');
    }

    handleDisconnect(client: any) {
        console.log('Client disconnected');
    }

    handleConnection(client: any, ...args: any[]) {
        console.log('Client connected');
    }
}