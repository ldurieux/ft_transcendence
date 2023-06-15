import { WebSocketGateway } from '@nestjs/websockets';
import { Inject, Injectable } from '@nestjs/common';
import { SocketServer } from './socket.server'; 

@WebSocketGateway()
@Injectable()
export class ChatGateway {
    constructor( 
        @Inject(SocketServer) private socketServer: SocketServer,
    ) {}

    async sendTo(to: number, data: object) {
        const raw = JSON.stringify(data)
        for (const client of this.socketServer.getServer().clients) {
            if (client.data.user == to)
            {
                client.send(raw)
            }
        }
    }
}