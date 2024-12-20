import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Logger } from '../services/logger.service';
import { HttpContextUtils } from '../utils/http.utils';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger: Logger;

  constructor(logger: Logger = new Logger('http')) {
    this.logger = logger;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const request = context.switchToHttp().getRequest();
    const requestContext = HttpContextUtils.getRequestContext(request);

    if (this.shouldSkipLogging(request)) {
      return next.handle();
    }

    // Set correlation ID
    const correlationId =
      request.headers['x-correlation-id'] || requestContext.correlationId;
    request.headers['x-correlation-id'] = correlationId;

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const response = context.switchToHttp().getResponse();

          if (response.statusCode < 400) {
            this.logger.info(
              `Processed ${requestContext.method} ${requestContext.path} ${response.statusCode} ${duration}ms`,
              {
                type: 'request.complete',
                correlationId,
                method: requestContext.method,
                path: requestContext.path,
              },
            );
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;

          this.logger.error(
            `Failed ${requestContext.method} ${requestContext.path} ${statusCode} ${duration}ms`,
            {
              type: 'request.error',
              correlationId,
              error,
            },
          );
        },
      }),
    );
  }

  private shouldSkipLogging(request: any): boolean {
    const skipPaths = ['/health', '/metrics', '/readiness', '/liveness'];
    return skipPaths.some((path) => request.url.startsWith(path));
  }

  private sanitizeRequestBody(body: any): any {
    if (!body) return body;
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'apiKey',
      'authorization',
    ];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
