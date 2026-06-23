import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseService } from '../services';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly responseService: ResponseService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        if (this.responseService.isApiEnvelope(data)) {
          return data;
        }

        const response = context.switchToHttp().getResponse<{ statusCode: number }>();
        const statusCode = response.statusCode || 200;

        if (data === undefined) {
          return this.responseService.success({}, statusCode);
        }

        if (data === null || typeof data !== 'object' || Array.isArray(data)) {
          return this.responseService.success({ value: data }, statusCode);
        }

        return this.responseService.success(
          data as Record<string, unknown>,
          statusCode,
        );
      }),
    );
  }
}
