import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException();
    }

    const token = authHeader.split(' ')[1];
    if (typeof token !== 'string' || token == "null") {
      console.log("[auth.guard.ts] Invalid/empty token was provided: " + token)
      throw new UnauthorizedException();
    }

    try {
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      const { id } = payload;

      req['user'] = id;
    } catch (err) {
      console.log("[auth.guard.ts] " + err)
      throw new UnauthorizedException();
    }
    return true;
  }
}

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

        socket.data.user = { id };
    } catch (err) {
        console.log("Invalid token was provided: " + token);
        throw new UnauthorizedException();
    }
    return (true);
  }
}