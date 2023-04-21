import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FriendRequest } from './friend-request.entity'
import { FriendRequestService } from './friend-request.service';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [TypeOrmModule.forFeature([FriendRequest]), forwardRef(() => UserModule)],
    providers: [FriendRequestService],
})
export class FriendRequestModule {}
