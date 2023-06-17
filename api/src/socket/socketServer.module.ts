import { Module, forwardRef } from '@nestjs/common';
import { SocketServer } from './socket.server';
import { GameGateway } from './game.gateway';
import { ChatGateway } from './chat.gateway';

import { SocketGuard } from 'src/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { GameService } from 'src/game/game.service';

import { UserService } from 'src/user/user.service';


@Module({
    providers: [ChatGateway, SocketServer, SocketGuard, JwtService, UserService, GameService, GameGateway],
  })

  export class SocketServerModule {}