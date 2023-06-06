import { MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';

//@UseGuards(JWTGuardSocket)
@WebSocketGateway({
    cors: {
		credentials: false,
		origin: '*',
	},
})
export class EventsGateway {
    handleConnection(client: any, ...args: any[]) {
        console.log('Client connected');
    }
    handleDisconnect(client: any) {
        console.log('Client disconnected');
    }
    handleMessage(client: any, payload: any) {
        console.log('Client message', payload);
    }
    @SubscribeMessage('message')
    handleMessageEvent(client: any, payload: any) {
        console.log('Client message', payload);
    }
}

