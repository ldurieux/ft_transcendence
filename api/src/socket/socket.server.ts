import * as WebSocket from 'ws';
import { OnGatewayConnection, OnGatewayDisconnect, MessageBody, OnGatewayInit ,SubscribeMessage, WebSocketGateway, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({ 
    transports: ['websocket']
})
export class SocketServer implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private jwtService: JwtService
    ) {}
    @WebSocketServer() server: WebSocket;

    afterInit(server: WebSocket) {
        // console.log('Init');
    }

    handleConnection(client: WebSocket) {
        client.data = {}
        console.log('Client isConnected');
    }
    
    @SubscribeMessage('auth')
    async handleAuth(@ConnectedSocket() client: WebSocket, @MessageBody('data') authHeader: any) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            client.terminate();
            console.log("Bearer")
            return;
        }

        const token = authHeader.split(' ')[1];
        if (typeof token !== 'string' || token == "null") {
            client.terminate();
            console.log("null")
            return;
        }

        try {
          const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
          const { id } = payload;

          client.data.user = id;
        } catch (err) {
            client.terminate();
            console.log(client.data, err,"No headers")
            return;
        }

        this.broadcast(client.data.user, { event: "connect", data: { user: client.data.user } })

        for (const other of this.server.clients) {
            const raw = JSON.stringify({ event: "connect", data: { user: other.data.user } })
            if (other.data.user != client.data.user)
                client.send(raw)
        }
    }

    async broadcast(from: number, data: object) {
        const raw = JSON.stringify(data)

        for (const client of this.server.clients) {
            if (client.data.user != from)
                client.send(raw)
        }
    }


    handleDisconnect(client: WebSocket) {
        this.broadcast(client.data.user, { event: "disconnect", data: { user: client.data.user } })
        console.log('Client disconnected');
    }

    getServer() {
        return this.server;
    }

    getSocket(id: number) {
        for (const client of this.server.clients) {
            if (client.data.user == id)
                return client;
        }
        return null;
    }
}
