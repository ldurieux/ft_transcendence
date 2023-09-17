import { Inject, Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Auth } from '../auth/auth.entity';
import { FriendRequest } from '../friend-request/friend-request.entity';
import { Game } from './game.entity';

import { Repository } from 'typeorm';

import { AuthService } from '../auth/auth.service';

import { User } from 'src/user/user.entity';

import { GameControler } from './game.controler';
import { GameReply } from 'src/socket/game.reply';
import { UserService } from 'src/user/user.service';
import { SocketServer } from 'src/socket/socket.server';
import { FriendRequestService } from 'src/friend-request/friend-request.service';

import { JwtService } from '@nestjs/jwt';

import { GameGateway } from 'src/gameSocket/game.gateway';


import * as gameInterface from './gameInterface'
import { GameSocketModule } from 'src/gameSocket/gameSocket.module';


@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([Auth]),
        TypeOrmModule.forFeature([FriendRequest]),
        TypeOrmModule.forFeature([Game]),
        forwardRef(() => GameSocketModule),
    ],
    providers: [JwtService, GameGateway, Repository, SocketServer, GameReply, UserService, GameControler, AuthService, FriendRequestService],
    controllers: [GameControler],
})
export class GameModule {}