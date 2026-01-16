import { CorrelationIdRequest } from '../../../../decorators/correlation-id-request';
import { ReturnUserDto } from '../dto';

export type UserRequest = CorrelationIdRequest & { user: ReturnUserDto };
