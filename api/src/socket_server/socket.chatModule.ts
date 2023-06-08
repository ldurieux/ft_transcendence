import { Module } from '@nestjs/common';
import { EventsGateway } from './socket.gateway';
import { JwtService } from '@nestjs/jwt';

@Module({
    providers: [EventsGateway, JwtService]
  })
export class EventsModule {}