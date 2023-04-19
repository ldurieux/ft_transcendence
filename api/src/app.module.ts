import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User } from './user/user.entity';
import { Auth } from './auth/auth.entity';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: 'db',
        port: 5432,
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_USER'),
        synchronize: true,
        entities: [User, Auth],
      }),
      inject: [ConfigService],
    }),
    UserModule, AuthModule
  ],
  controllers: [AppController],
})

export class AppModule {
}
