import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/user/user.entity';
import { Channel } from 'src/channel/channel.entity';
import { Action } from './action.entity';

@Injectable()
export class ActionService {
    constructor(
        @InjectRepository(Action)
        private actionRepository: Repository<Action>,
    ) {}

    async addBan(user: User, channel: Channel, duration: number) {
        let action: Action = new Action;
        action.channel = channel;
        action.user = user;
        action.type = "ban";
        action.until = new Date()
        action.until.setSeconds(action.until.getSeconds() + duration);

        await this.actionRepository.save(action);
    }

    async addMute(user: User, channel: Channel, duration: number) {
        let action: Action = new Action;
        action.channel = channel;
        action.user = user;
        action.type = "mute";
        action.until = new Date()
        action.until.setSeconds(action.until.getSeconds() + duration);

        await this.actionRepository.save(action);
    }

    async isBanned(user: User, channel: Channel) : Promise<boolean> {
        const actions: Action[] = await this.actionRepository.createQueryBuilder('action')
            .leftJoin('action.channel', 'channel')
            .leftJoin('action.user', 'user')
            .where('action.type = :type', { type: "ban" })
            .andWhere('channel.id = :channelId', { channelId: channel.id })
            .andWhere('user.id = :userId', { userId: user.id })
            .getMany()

        for (const action of actions) {
            if (action.until > new Date())
                return true
        }

        return false;
    }

    async isMuted(user: User, channel: Channel) : Promise<boolean> {
        const actions: Action[] = await this.actionRepository.createQueryBuilder('action')
            .leftJoin('action.channel', 'channel')
            .leftJoin('action.user', 'user')
            .where('action.type = :type', { type: "mute" })
            .andWhere('channel.id = :channelId', { channelId: channel.id })
            .andWhere('user.id = :userId', { userId: user.id })
            .getMany()

        for (const action of actions) {
            if (action.until > new Date())
                return true
        }

        return false;
    }
}
