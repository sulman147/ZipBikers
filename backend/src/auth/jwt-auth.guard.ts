import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthService } from './auth.service';

/**
 * Lightweight JWT guard - verifies the `Authorization: Bearer <token>`
 * header using @nestjs/jwt (no passport dependency needed) and attaches
 * the resolved User to `req.user`.
 *
 * v1 note: this guard is currently only applied to GET /api/auth/me.
 * To protect other routes (bikes, riders, etc.) later, either:
 *   1) add `@UseGuards(JwtAuthGuard)` to individual controllers/handlers, or
 *   2) register it as an APP_GUARD in app.module.ts to protect everything,
 *      then use `@Public()` (you'd need to add such a decorator) to opt
 *      specific routes (like /auth/login) out of it.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token);
      const user = this.authService.findUserById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User no longer exists');
      }
      (request as any).user = user;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(request: Request): string | null {
    const header = request.headers['authorization'];
    if (!header || Array.isArray(header) || !header.startsWith('Bearer ')) {
      return null;
    }
    return header.slice('Bearer '.length).trim();
  }
}
