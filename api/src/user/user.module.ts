
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtService } from '@nestjs/jwt';

import { AuthModule } from 'src/auth/auth.module';

import { Auth } from 'src/auth/auth.entity';
import { AuthService } from 'src/auth/auth.service';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controler';

@Module({
  imports: [TypeOrmModule.forFeature([User]), TypeOrmModule.forFeature([Auth])],
  providers: [UserService, AuthService, JwtService],
  controllers: [UserController]
})
export class UserModule {}