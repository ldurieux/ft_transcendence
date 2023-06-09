import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, ConnectedSocket, WsException } from '@nestjs/websockets';
import { TextEncoder } from 'util';

import { UserService } from 'src/user/user.service';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ChannelService } from 'src/channel/channel.service';
import { MessageService } from 'src/message/message.service';
import { UseGuards } from '@nestjs/common';

interface MessageInterface {
    UserId: number;
    ChannelId: number;
    message: string;
    timestamp: Date;
}

interface ChannelInterface {
    ChannelId: number;
    Password: string;
    UserId: number;
}

@WebSocketGateway(3001, {
    namespace: '/chat',
    transport: ['websocket']
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
    @WebSocketServer() server: WebSocket;

    constructor(
        private userService: UserService,
        private chatService: MessageService,
        private channelService: ChannelService,
        private authService: AuthService
    ) {}

    afterInit(server: WebSocket) {
        console.log('Init');
    }

    @UseGuards(AuthGuard)
    handleConnection(@ConnectedSocket() client: WebSocket) {
        console.log('Client isConnected');
    }
    
    handleDisconnect(@ConnectedSocket() client: WebSocket) {
        console.log('Client disconnected');
    }

    /**
     * message handler for direct messages to channels and users
     * @param channelInterface
     * @param WebsocketClient
     */
    @UseGuards(AuthGuard)
    @SubscribeMessage('message')
    async handleMessage(@MessageBody() data: MessageInterface, @ConnectedSocket() client: WebSocket) {
        const bytesReceived = new TextEncoder().encode(data.message).length;
        if (bytesReceived > 4096) {
            throw new WsException('Message too long');
        }
        else {
            const user = await this.userService.getUser(data.UserId);
            if (!user) {
                throw new WsException('User not found');
            }
            const channel = await this.channelService.getChannel(data.ChannelId);
            if (!channel) {
                throw new WsException('Channel not found');
            }
            this.chatService.createMessage(data.ChannelId, data.message);
        }
    }

    /**
     * join handler for joining channels
     * @param channelInterface
     * @param WebsocketClient
     */
    @UseGuards(AuthGuard)
    @SubscribeMessage('join')
    async handleChannelJoin(@MessageBody() data: ChannelInterface, @ConnectedSocket() client: WebSocket) {
        const user = await this.userService.getUser(data.UserId);
        if (!user) {
            throw new WsException('User not found');
        }
        this.channelService.joinChannel(user, data.ChannelId, data.Password);
    }

    /**
     * leave handler for leaving channels
     * @param channelInterface
     * @param WebsocketClient
     */
    @UseGuards(AuthGuard)
    @SubscribeMessage('leave')
    async handleChannelLeave(@MessageBody() data: ChannelInterface, @ConnectedSocket() client: WebSocket) {
        const user = await this.userService.getUser(data.UserId);
        if (!user) {
            throw new WsException('user not found');
        }
        this.channelService.leaveChannel(user, data.ChannelId);
    }
}
