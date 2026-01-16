import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { CorrelationIdRequest } from './correlation-id-request';

export const CorrId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request: CorrelationIdRequest = ctx.switchToHttp().getRequest();

    return request.correlationId;
  },
);
