import { Inject, Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Auth } from '../auth/auth.entity';
import { FriendRequest } from '../friend-request/friend-request.entity';
import { Game } from './game.entity';

import { AuthService } from '../auth/auth.service';
import { FriendRequestService } from '../friend-request/friend-request.service';

import { User } from 'src/user/user.entity';

import { GameGateway } from 'src/socket/game.gateway';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([Auth]),
        TypeOrmModule.forFeature([FriendRequest]),
        TypeOrmModule.forFeature([Game]),
    ],
    providers: [AuthService, FriendRequestService],
})
export class GameModule {}