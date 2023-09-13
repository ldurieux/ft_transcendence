import { Module, forwardRef } from "@nestjs/common";

import { SocketGuard } from 'src/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';

import { GameService } from '../game/game.service';

import { GameModule } from "src/game/game.module";

import { UserService } from "src/user/user.service";

@Module({
    imports: [
        forwardRef(() => GameModule)
    ],
    providers: [SocketGuard, JwtService, GameService, UserService],
})

export class GameSocketModule {}