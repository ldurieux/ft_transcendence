
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtService } from '@nestjs/jwt';

import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controler';
import { Game } from 'src/game/game.entity';

import { FriendRequest } from 'src/friend-request/friend-request.entity';
import { Auth } from 'src/auth/auth.entity';
import { AuthModule } from 'src/auth/auth.module';
import { FriendRequestModule } from 'src/friend-request/friend-request.module';
import { AuthService } from 'src/auth/auth.service';
import { FriendRequestService } from 'src/friend-request/friend-request.service';
import { SocketServer } from 'src/socket/socket.server';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Auth]),
    TypeOrmModule.forFeature([FriendRequest]),
    TypeOrmModule.forFeature([Game]),
  ],
  providers: [UserService, AuthService, FriendRequestService, JwtService, AuthModule, FriendRequestModule],
  controllers: [UserController],
})
export class UserModule {}