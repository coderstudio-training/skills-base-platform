import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../logger.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const correlationId = request.headers['x-correlation-id'] || uuidv4();
    const method = request.method;
    const url = request.url;
    const startTime = Date.now();

    // Log the incoming request
    this.logger.log('Incoming request', {
      correlationId,
      method,
      url,
      headers: request.headers,
      query: request.query,
      body: request.body,
    });

    return next.handle().pipe(
      tap({
        next: (response) => {
          // Log the successful response
          this.logger.log('Request completed', {
            correlationId,
            method,
            url,
            duration: `${Date.now() - startTime}ms`,
            response,
          });
        },
        error: (error) => {
          // Log any errors
          this.logger.error('Request failed', {
            correlationId,
            method,
            url,
            duration: `${Date.now() - startTime}ms`,
            error: {
              message: error.message,
              stack: error.stack,
            },
          });
        },
      }),
    );
  }
}
