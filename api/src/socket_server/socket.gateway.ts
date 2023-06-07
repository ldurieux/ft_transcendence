import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { WebSocket } from 'ws';
import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { subscribe } from 'diagnostics_channel';
import { send } from 'process';
//@UseGuards(JWTGuardSocket)
@WebSocketGateway({
    transport: ['websocket']
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
    @WebSocketServer() server: WebSocket;

    afterInit(server: any) {
        console.log('Init');
    }

    handleConnection(client: any, ...args: any[]) {
        console.log('Client isConnected');
    }
    handleDisconnect(client: any) {
        console.log('Client disconnected');
    }

    @SubscribeMessage('message')
    async onChgEvent(client: WebSocket, payload: any) {
        console.log('Client message', payload);
    }

    @SubscribeMessage('send_message')
    async onSendMessage(client: WebSocket, payload: any) {
        console.log('Client message', payload);
        client.send('truc');
    }
}
