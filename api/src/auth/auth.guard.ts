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
      const { id, twoFaRequired } = payload;

      req['user'] = id;

      if (twoFaRequired)
        throw new UnauthorizedException();
    } catch (err) {
      console.log("[auth.guard.ts] " + err)
      throw new UnauthorizedException();
    }
    return true;
  }
}
