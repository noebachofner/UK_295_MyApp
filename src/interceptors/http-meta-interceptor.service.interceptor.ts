import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { finalize, Observable } from 'rxjs';
import { randomInt } from 'node:crypto';
import { CorrelationIdRequest } from '../decorators/correlation-id-request';

@Injectable()
export class HttpMetaInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest<CorrelationIdRequest>();
    const res = http.getResponse<Response>();

    const headerCorrId = req.header('x-correlation-id');

    const correlationId =
      (headerCorrId ? parseInt(headerCorrId?.trim(), 10) : null) ||
      randomInt(10000, 99999);
    req.correlationId = correlationId;

    Logger.log(
      `${req.correlationId} ${req.method} ${req.url} from ${req.ip}`,
      HttpMetaInterceptor.name,
    );

    const start = process.hrtime.bigint();

    return next.handle().pipe(
      finalize(() => {
        const durationNs = process.hrtime.bigint() - start;
        const durationMs = Number(durationNs) / 1_000_000;

        res.setHeader('X-Correlation-Id', correlationId);

        res.setHeader('X-Response-Time', `${durationMs.toFixed(2)}ms`);
      }),
    );
  }
}
