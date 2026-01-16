import { Request } from 'express';
export type CorrelationIdRequest = Request & { correlationId: number };
