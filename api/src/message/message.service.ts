import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/user/user.entity';
import { Channel } from 'src/channel/channel.entity';
import { Message } from './message.entity';

@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
    ) {}

    async addMessage(user: User, channel: Channel, text: string): Promise<Message> {
        let message: Message = new Message;
        message.owner = user;
        message.channel = channel;
        message.text = text;
        message.created_at = new Date();

        await this.messageRepository.save(message);
        return message;
    }

    async getMessages(channel: Channel): Promise<Message[]> {
        return this.messageRepository.createQueryBuilder('message')
            .leftJoin('message.channel', 'channel')
            .leftJoinAndSelect('message.owner', 'user')
            .where('channel.id = :channelId', { channelId: channel.id })
            .select(['message.text', 'message.created_at', 'user.id'])
            .orderBy('message.created_at', 'ASC')
            .getMany();
    }
}
