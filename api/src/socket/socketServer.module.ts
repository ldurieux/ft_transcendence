import { Module, forwardRef } from '@nestjs/common';
import { SocketServer } from './socket.server';
import { GameGateway } from './game.gateway';
import { ChatGateway } from './chat.gateway';

import { SocketGuard } from 'src/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';

import { GameModule } from 'src/game/game.module';
import { UserModule } from 'src/user/user.module';
import { GameService } from 'src/game/game.service';
import { UserService } from 'src/user/user.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';

@Module({
    imports: [
      TypeOrmModule.forFeature([User]),
    ],
    providers: [GameGateway, ChatGateway, SocketServer, JwtService, GameService, SocketGuard, UserService],
    exports: [GameGateway, ChatGateway],
  })

  export class SocketServerModule {}