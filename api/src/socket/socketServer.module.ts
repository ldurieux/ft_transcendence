import { Module } from '@nestjs/common';
import { SocketServer } from './socket.server';
import { GameGateway } from './game.gateway';

@Module({
    providers: [GameGateway]
  })
export class SocketServerModule {}