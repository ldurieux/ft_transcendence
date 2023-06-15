import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Auth } from '../auth/auth.entity';
import { FriendRequest } from '../friend-request/friend-request.entity';
import { Game } from './game.entity';

import { AuthService } from '../auth/auth.service';
import { FriendRequestService } from '../friend-request/friend-request.service';
import { GameService } from './game.service';

import { User } from 'src/user/user.entity';
import { SocketServer } from 'src/socket/socket.server';

import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([Auth]),
        TypeOrmModule.forFeature([FriendRequest]),
        TypeOrmModule.forFeature([Game]),
        forwardRef(() => UserModule)
    ],
    providers: [AuthService, FriendRequestService, GameService, UserService],
})
export class GameModule {}