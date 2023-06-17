import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User } from './user/user.entity';
import { Auth } from './auth/auth.entity';
import { FriendRequest } from './friend-request/friend-request.entity';
import { Channel } from './channel/channel.entity';
import { Game } from './game/game.entity';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { FriendRequestModule } from './friend-request/friend-request.module';
import { ChannelModule } from './channel/channel.module';

import { Message } from './message/message.entity';
import { Action } from './action/action.entity';

// import { SocketServerModule } from 'src/socket/socketServer.module';

import { GameModule } from './game/game.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: 'db',
        port: 5432,
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_USER'),
        synchronize: true,
        entities: [Game, User, Auth, FriendRequest, Channel, Message, Action],
      }),
      inject: [ConfigService],
    }),
    UserModule, AuthModule, FriendRequestModule, ChannelModule, GameModule
  ],
  controllers: [AppController],
})

export class AppModule {}
