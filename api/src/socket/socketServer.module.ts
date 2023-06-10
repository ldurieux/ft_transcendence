import { Module } from '@nestjs/common';
import { SocketServer } from './socket.server';
import { GameGateway } from './game.gateway';
import { ChatGateway } from './chat.gateway';

import { SocketGuard } from 'src/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';


@Module({
    providers: [GameGateway, ChatGateway, SocketServer, SocketGuard, JwtService],
  })
export class SocketServerModule {}