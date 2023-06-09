import { Controller } from '@nestjs/common';

import { GameService } from './game.service';

import { AuthGuard } from 'src/auth/auth.guard';

@Controller('game')
export class GameController {}
{
}