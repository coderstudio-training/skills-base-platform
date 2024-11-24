import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Logger } from '../services/logger.service';
import { ErrorTracker } from '../utils/error-tracker.util';
import { HttpContextUtils } from '../utils/http.utils';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly errorTracker: ErrorTracker;

  constructor(private readonly logger: Logger = new Logger('http')) {
    this.errorTracker = new ErrorTracker();
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const requestContext = HttpContextUtils.getRequestContext(request);

    if (this.shouldSkipLogging(request)) {
      return next.handle();
    }

    // Set correlation ID
    const correlationId =
      request.headers['x-correlation-id'] || requestContext.correlationId;
    request.headers['x-correlation-id'] = correlationId;

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        if (response.statusCode < 400) {
          // Only log successful requests here
          this.logger.info(
            `Processed ${requestContext.method} ${requestContext.path}`,
            {
              type: 'request.complete',
              correlationId,
              duration,
              statusCode: response.statusCode,
              method: requestContext.method,
              path: requestContext.path,
            },
          );
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode = error.status || 500;

        // Enhanced error logging for validation errors
        if (error instanceof BadRequestException) {
          const validationMetadata = (error as any).validationMetadata;
          if (validationMetadata) {
            this.logger.error(error, {
              type: 'validation.error',
              correlationId,
              method: requestContext.method,
              path: requestContext.path,
              statusCode,
              duration,
              validation: {
                errors: validationMetadata.validationErrors,
                receivedValue: this.sanitizeRequestBody(
                  validationMetadata.receivedValue,
                ),
                expectedType: validationMetadata.expectedType,
              },
            });

            // Don't log the request completion for validation errors
            return throwError(() => error);
          }
        }

        this.logger.error(error, {
          type: 'request.error',
          correlationId,
          method: requestContext.method,
          path: requestContext.path,
          statusCode,
          duration,
        });

        return throwError(() => error);
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
