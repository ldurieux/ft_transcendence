import { GameGateway } from "./game.gateway";

import { WebSocketGateway } from '@nestjs/websockets';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway()
export class GameSocketReply {
    constructor(
        @Inject(GameGateway) private gameGateway: GameGateway,
    ){}
}