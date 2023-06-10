import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { WebSocketServer, WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class SocketGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
   ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const socket = context.switchToWs().getClient();

    const authHeader = socket.handshake.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException();
    }

    const token = authHeader.split(' ')[1];
    if (!token || typeof token !== 'string' || token == 'null') {
        console.log("Invalid/empty token was provided: " + token);
        throw new UnauthorizedException();
    }

    try {
        const decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
        const { id } = decoded;

        socket.user = { id };
    } catch (err) {
        console.log("Invalid token was provided: " + token);
        throw new UnauthorizedException();
    }
    return (true);
  }
}