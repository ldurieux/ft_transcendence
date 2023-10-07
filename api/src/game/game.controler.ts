import { UserService } from "src/user/user.service";
import { AuthGuard } from "src/auth/auth.guard";
import { HttpException, HttpStatus, Controller, Get, Post, Body, Request, UseGuards, UploadedFile, UseInterceptors, ParseFilePipe, FileTypeValidator, MaxFileSizeValidator } from '@nestjs/common';

import { GameReply } from "src/socket/game.reply";
import { GameGateway } from "src/gameSocket/game.gateway";
import { type } from "os";

// import { GameService } from "./game.service";

@Controller('game')
export class GameControler
{
    constructor(
        private readonly userService: UserService,
        private readonly gameReply: GameReply,
        private readonly gameGateway: GameGateway,
    ){}

    @UseGuards(AuthGuard)
    @Post('invite')
    async gameInvite(@Request() req)
    {
        const id = req['user'];
        const typeOfGame:number = req.body.typeOfGame;
        const friendId:number = req.body.id;

        if (typeof friendId !== 'number')
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        if (typeof typeOfGame !== 'number')
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        this.gameReply.invite(id, friendId, typeOfGame);
    }

    @UseGuards(AuthGuard)
    @Post('inviteResponse')
    async gameInviteResponse(@Request() req)
    {
        const {myId, id, response, typeOfGame } = req.Body;
        
        if (typeof typeOfGame !== 'number')
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        if (typeof myId !== 'number')
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        if (typeof id !== 'number')
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        if (typeof response !== 'boolean')
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        if (response === true)
        {
            this.gameReply.gameStart(myId, id, typeOfGame);
        }
        else
        {
            this.gameReply.inviteRefused(myId, id);
        }
    }

    @UseGuards(AuthGuard)
    @Post('MatchMaking')
    async gameMatchMaking(@Request() req) {
        const id = req['user'];
        const typeOfGame:number = req.body.typeOfGame;

        if (typeof typeOfGame !== 'number')
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        this.gameReply.MatchMaking(id, typeOfGame);
    }

    @UseGuards(AuthGuard)
    @Get('MatchHistory')
    async getMatchHistory(@Request() req) {
        const id = req['user'];
        const gameHistory = await this.userService.getMatchHistory(id);
        return gameHistory;
    }

    @UseGuards(AuthGuard)
    @Get('isInGame')
    async isInGame(@Request() req) {
        const id = req['user'];
        const isInGame = await this.gameGateway.isInGame(id);
        return isInGame;
    }
}