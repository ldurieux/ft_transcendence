import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Auth } from './auth.entity'
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [TypeOrmModule.forFeature([Auth]), forwardRef(() => UserModule)],
    providers: [AuthService],
})
export class AuthModule {}
