import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';
import { UserRequest } from '../types/user-request';

export const IsAdmin = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request: UserRequest = ctx.switchToHttp().getRequest();
    Logger.log('', 'IsAdmin.decorator.ts');
    const user = request.user;
    if (!user) {
      Logger.warn('User not found in request', 'isAdmin.decorator.ts');
      return false;
    } else {
      Logger.log(
        `User found: ${user.username} IsAdmin: ${JSON.stringify(user, null, 2)}`,
        'is-admin.decorator.ts',
      );
    }
    return user.isAdmin;
  },
);
