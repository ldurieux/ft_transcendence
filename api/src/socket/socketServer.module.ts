import { Module, forwardRef } from '@nestjs/common';
import { SocketServer } from './socket.server';
import { ChatGateway } from './chat.gateway';

import { SocketGuard } from 'src/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';

import { UserService } from 'src/user/user.service';

import { GeneralReply } from './general.reply';

@Module({
    providers: [ChatGateway, SocketServer, SocketGuard, JwtService, UserService, GeneralReply],
  })

  export class SocketServerModule {}