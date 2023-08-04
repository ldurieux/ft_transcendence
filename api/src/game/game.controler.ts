import { UserService } from "src/user/user.service";
import { AuthGuard } from "src/auth/auth.guard";
import { HttpException, HttpStatus, Controller, Get, Post, Body, Request, UseGuards, UploadedFile, UseInterceptors, ParseFilePipe, FileTypeValidator, MaxFileSizeValidator } from '@nestjs/common';

import { GameReply } from "src/socket/game.reply";

import { GameService } from "./game.service";

import { playersWithReady } from "./gameInterface";

@Controller('game')
export class GameControler
{
    constructor(
        private readonly userService: UserService,
        private readonly gameService: GameService,
        private readonly gameReply: GameReply,
    ){}

    @UseGuards(AuthGuard)
    @Post('invite')
    async gameInvite(@Request() req)
    {
        const { id} = req.Body;

        if (typeof id !== 'number')
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        const friend = await this.userService.getUser(id);
        this.gameReply.invite('invite', id, friend);
    }

    @UseGuards(AuthGuard)
    @Post('inviteResponse')
    async gameInviteResponse(@Request() req)
    {
        const {myId, id, response } = req.Body;
        
        if (typeof myId !== 'number')
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        if (typeof id !== 'number')
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        if (typeof response !== 'boolean')
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        if (response === true)
        {
            this.gameReply.gameStart(myId, id);
        }
        else
        {
            this.gameReply.inviteRefused(myId, id);
        }
    }

    @UseGuards(AuthGuard)
    @Post('matchMakingResponse')
    async gameMatchMakingResponse(@Request() req)
    {
        const { id, response } = req.Body;
        if (id !== 'number')
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        if (response !== 'boolean')
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        const playerData: playersWithReady = await this.gameReply.getPlayerMapValue(id);
        if (response === true)
        {
            if (id === playerData.Players.player1Id)
                playerData.Ready.player1Ready = true;
            else
                playerData.Ready.player2Ready = true;
        }
        else
        {
            this.gameReply.matchMakingInviteRefused(playerData.Players.player1Id, playerData.Players.player2Id);
        }
        if (playerData.Ready.player1Ready === true && playerData.Ready.player2Ready === true)
        {
            this.gameReply.gameStart(playerData.Players.player1Id, playerData.Players.player2Id);
        }
    }

    @UseGuards(AuthGuard)
    @Post('MatchMaking')
    async gameMatchMaking(@Request() req)
    {
        const { id } = req.Body;

        if (typeof id !== 'number')
            throw new HttpException("", HttpStatus.BAD_REQUEST);
        const waitingsPlayer = await this.gameReply.MatchMaking(id);
        if (waitingsPlayer === null)
            return;
        this.gameReply.MatchMaking(id);
    }

}