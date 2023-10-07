import { Injectable } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { SocketServer } from "./socket.server";
import { Inject } from "@nestjs/common";
import { WebSocketGateway } from "@nestjs/websockets";

@WebSocketGateway()
@Injectable()
export class GeneralReply {
    constructor(
        private readonly userService: UserService,
        @Inject(SocketServer) private readonly socketServer: SocketServer,
    ){}

    async sendStatus(id: number, status: string)
    {
        const userFriendList = (await this.userService.getUser(id, true)).friends;
        console.log(userFriendList);
        for (const friend of userFriendList)
        {
            const socket = await this.socketServer.getSocket(friend.id);
            if (socket !== null)
                socket.send(JSON.stringify({type: 'connect', status: status}));
        }
    }

}