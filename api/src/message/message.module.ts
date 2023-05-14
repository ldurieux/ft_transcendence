import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Message } from './message.entity'
import { MessageService } from './message.service';
import { ChannelModule } from 'src/channel/channel.module';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Message]),
        forwardRef(() => ChannelModule),
        forwardRef(() => UserModule)
    ],
    providers: [MessageService],
})
export class FriendRequestModule {}
