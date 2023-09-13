import { Inject, UseGuards, Injectable, ValidationPipe, forwardRef } from '@nestjs/common';

import { OnGatewayConnection, OnGatewayDisconnect, MessageBody, OnGatewayInit ,SubscribeMessage, WebSocketGateway, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';

import { SocketGuard } from 'src/auth/auth.guard';
import { WebSocket } from 'ws';

import { JwtService } from '@nestjs/jwt';

@WebSocketGateway()
@Injectable()
export class gameInstanceReply {

}