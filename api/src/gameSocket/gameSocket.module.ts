import { Module, forwardRef } from "@nestjs/common";

import { SocketGuard } from 'src/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';

import { GameService } from '../game/game.service';

import { GameModule } from "src/game/game.module";

import { UserService } from "src/user/user.service";

import { GameGateway } from './game.gateway';

import { Repository } from 'typeorm';

import { User } from "src/user/user.entity";

import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from "src/auth/auth.service";

import { Auth } from "src/auth/auth.entity";

import { FriendRequestService } from "src/friend-request/friend-request.service";

import { FriendRequest } from "src/friend-request/friend-request.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([Auth]),
        TypeOrmModule.forFeature([FriendRequest]),
        forwardRef(() => GameModule)
    ],
    providers: [Repository, AuthService, FriendRequestService, SocketGuard, JwtService, GameGateway, GameService, UserService],
})

export class GameSocketModule {}