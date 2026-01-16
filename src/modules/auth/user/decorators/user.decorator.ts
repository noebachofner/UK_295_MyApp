import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';

import { UserRequest } from '../types/user-request';

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request: UserRequest = ctx.switchToHttp().getRequest();
    Logger.log('', 'user.decorator.ts');
    const user = request.user;
    if (!user) {
      Logger.warn('User not found in request', 'user.decorator.ts');
    } else {
      Logger.log(
        `User found: ${user.username} user: ${JSON.stringify(user, null, 2)}`,
        'user.decorator.ts',
      );
    }
    return user;
  },
);
