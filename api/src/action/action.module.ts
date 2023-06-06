import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Action } from './action.entity'
import { ActionService } from './action.service';
import { ChannelModule } from 'src/channel/channel.module';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Action]),
        forwardRef(() => ChannelModule),
        forwardRef(() => UserModule)
    ],
    providers: [ActionService],
})
export class FriendRequestModule {}
