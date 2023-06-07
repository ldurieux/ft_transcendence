import { User } from '../user/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from '../auth/auth.entity';
import { FriendRequest } from '../friend-request/friend-request.entity';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';
import { FriendRequestService } from '../friend-request/friend-request.service';
import { Game } from './game.entity';
import { GameService } from './game.service';


@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([Auth]),
        TypeOrmModule.forFeature([FriendRequest]),
    ],
    providers: [UserService, AuthService, FriendRequestService, GameService],
})
export class GameModule {}