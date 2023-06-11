import { MessageBody, SubscribeMessage, WebSocketGateway, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { WebSocket } from 'ws';
import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { subscribe } from 'diagnostics_channel';
import { send } from 'process';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
    transport: ['websocket']
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
    @WebSocketServer() server: WebSocket;

    constructor(private readonly jwtService: JwtService) {}

    afterInit(server: any) {
    }

    handleConnection(client: WebSocket, ...args: any[]) {
        console.log("connected");
        client.data = {}
        // console.log(args);
        //
        // if (args.length < 1) {
        //     client.terminate();
        //     console.log("args")
        //     return;
        // }
        // const data = args[0];
        //
        // if (typeof data !== 'object') {
        //     client.terminate();
        //     console.log("object")
        //     return;
        // }
        //
        // const rawHeaders = data['rawHeaders'];
        //
        // if (!(rawHeaders instanceof Array)) {
        //     client.terminate();
        //     console.log("Array")
        //     return;
        // }
        //
        // const index = rawHeaders.indexOf('Authorization') + 1;
        //
        // if (index <= 0 || index >= rawHeaders.length) {
        //     client.terminate();
        //     console.log("authorization")
        //     return;
        // }
        //
        // const authHeader = rawHeaders[index];
        // if (!authHeader || !authHeader.startsWith('Bearer ')) {
        //     client.terminate();
        //     console.log("Bearer")
        //     return;
        // }
        //
        // const token = authHeader.split(' ')[1];
        // if (typeof token !== 'string' || token == "null") {
        //     client.terminate();
        //     console.log("null")
        //     return;
        // }
        //
        // try {
        //   const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
        //   const { id } = payload;
        //
        //   client.data.user = id;
        // } catch (err) {
        //     client.terminate();
        //     console.log("No headers")
        //     return;
        // }
        //
        // this.broadcast(client.data.user, { event: "connect", data: { user: client.data.user } })
        //
        // for (const other of this.server.clients) {
        //     const raw = JSON.stringify({ event: "connect", data: { user: other.data.user } })
        //     if (other.data.user != client.data.user)
        //         client.send(raw)
        // }
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

    handleDisconnect(client: WebSocket) {
        this.broadcast(client.data.user, { event: "disconnect", data: { user: client.data.user } })
        console.log("disconnected");
    }

    async broadcast(from: number, data: object) {
        const raw = JSON.stringify(data)

        for (const client of this.server.clients) {
            if (client.data.user != from)
                client.send(raw)
        }
    }

    async sendTo(to: number, data: object) {
        const raw = JSON.stringify(data)

        for (const client of this.server.clients) {
            if (client.data.user == to)
                client.send(raw)
        }
    }
}
