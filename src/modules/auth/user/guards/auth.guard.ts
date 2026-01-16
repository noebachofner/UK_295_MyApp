import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UserService } from '../services/user.service';
import { UserRequest } from '../types/user-request';
import { PayloadDto } from '../../dto/payload.dto';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UserService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    const request: UserRequest = context.switchToHttp().getRequest();

    if (isPublic) {
      Logger.verbose(
        `${request.correlationId} ${AuthGuard.name} is requesting a public endpoint`,
      );
      return true;
    }

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      Logger.error(
        `${request.correlationId} Missing token in request`,
        AuthGuard.name,
      );
      throw new UnauthorizedException();
    }

    const user = await this.validateTokenAndFetchUser(
      request.correlationId,
      token,
    );

    request.user = user;
    Logger.verbose(
      `${request.correlationId} ${AuthGuard.name} user: ${JSON.stringify(user, null, 2)} found!`,
    );
    return true;
  }

  private async validateTokenAndFetchUser(
    correlationId: number,
    token: string,
  ) {
    const secret = this.configService.get<string>('JWT_SECRET');

    let payload: PayloadDto;
    try {
      payload = await this.jwtService.verifyAsync<PayloadDto>(token, {
        secret,
      });
    } catch (err) {
      Logger.warn(
        `${correlationId} Invalid/expired token (${err instanceof Error ? err.message : String(err)})`,
        AuthGuard.name,
      );
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.usersService.findOne(correlationId, payload.sub);

    if (!user) {
      Logger.error(`${correlationId} User not found`, AuthGuard.name);
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
