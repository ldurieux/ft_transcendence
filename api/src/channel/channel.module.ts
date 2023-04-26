
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

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Auth]),
    TypeOrmModule.forFeature([FriendRequest]),
    TypeOrmModule.forFeature([Channel]),
  ],
  providers: [UserService, AuthService, ChannelService, FriendRequestService, JwtService],
  controllers: [ChannelController],
})
export class ChannelModule {}