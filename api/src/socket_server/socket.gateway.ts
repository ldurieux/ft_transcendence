import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { WebSocket } from 'ws';
import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
//@UseGuards(JWTGuardSocket)
@WebSocketGateway({
    transport: ['websocket'],
    cors: {
		credentials: false,
		origin: '*',
	},
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
    @WebSocketServer() server: WebSocket;

    afterInit(server: any) {
        console.log('Init');
    }

    handleConnection(client: any, ...args: any[]) {
        console.log('baguette');
    }
    handleDisconnect(client: any) {
        console.log('Client disconnected');
    }
    @SubscribeMessage('message')
    async onChgEvent(client: any, payload: any) {
        console.log(client);
        console.log('Client message', payload);
        return (payload);
        console.log('test');
    }
    @SubscribeMessage('send_message')
    async listenForMessages(@MessageBody() data: string) {
        console.log(data);
  }
}
