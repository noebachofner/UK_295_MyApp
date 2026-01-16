import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';
import { UserRequest } from '../types/user-request';

export const UserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request: UserRequest = ctx.switchToHttp().getRequest();
    Logger.log('', 'UserId.decorator.ts');
    const user = request.user;
    if (!user) {
      Logger.warn('User not found in request', 'UserId.decorator.ts');
    } else {
      Logger.log(
        `User found: ${user.username} UserId: ${JSON.stringify(user, null, 2)}`,
        'is-UserId.decorator.ts',
      );
    }
    return user.id;
  },
);
