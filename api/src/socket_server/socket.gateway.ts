import { MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { WebSocket } from 'ws';
import { UseGuards } from '@nestjs/common';

//@UseGuards(JWTGuardSocket)
@WebSocketGateway({
    transport: ['websocket'],
    cors: {
		credentials: false,
		origin: '*',
	},
})
export class EventsGateway {
    handleConnection(client: WebSocket, ...args: any[]) {
        console.log('Client connected');
    }
    handleDisconnect(client: WebSocket) {
        console.log('Client disconnected');
    }
    handleMessage(client: WebSocket, payload: any) {
        console.log('Client message', payload);
    }
    @SubscribeMessage('message')
    handleMessageEvent(client: WebSocket, payload: any) {
        console.log('Client message', payload);
    }
}

