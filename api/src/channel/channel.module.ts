
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtService } from '@nestjs/jwt';

import { Channel } from './channel.entity';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';

import { User } from 'src/user/user.entity';
import { Auth } from 'src/auth/auth.entity';
import { FriendRequest } from 'src/friend-request/friend-request.entity';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { FriendRequestService } from 'src/friend-request/friend-request.service';
import { Message } from 'src/message/message.entity';
import { MessageService } from 'src/message/message.service';
import { Action } from 'src/action/action.entity';
import { ActionService } from 'src/action/action.service';
import { GameService } from 'src/game/game.service';
import { Game } from 'src/game/game.entity';

import { ChatGateway } from 'src/socket/chat.gateway';
import { SocketServer } from 'src/socket/socket.server';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Auth]),
    TypeOrmModule.forFeature([FriendRequest]),
    TypeOrmModule.forFeature([Channel]),
    TypeOrmModule.forFeature([Message]),
    TypeOrmModule.forFeature([Action]),
    TypeOrmModule.forFeature([Game]),
  ],
  providers: [SocketServer, ChatGateway, UserService, AuthService, ChannelService, FriendRequestService, MessageService, ActionService, JwtService, GameService],
  controllers: [ChannelController],
})
export class ChannelModule {}