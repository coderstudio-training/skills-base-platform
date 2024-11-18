import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Logger } from '../services/logger.service';
import { HttpContextUtils } from '../utils/http.utils';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger = new Logger('http')) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const requestContext = HttpContextUtils.getRequestContext(request);

    // Don't log health checks or other monitoring endpoints
    if (this.shouldSkipLogging(request)) {
      return next.handle();
    }
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;

        this.logger.info(
          `Processed ${requestContext.method} ${requestContext.path} ${response.statusCode} ${duration}ms`,
          {
            type: 'request.complete',
          },
        );
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode = error.status || 500;

        this.logger.error(
          `Error processing ${requestContext.method} ${requestContext.path}`,
          {
            type: 'request.error',
            ...requestContext,
            error: {
              name: error.name,
              message: error.message,
              stack: error.stack,
            },
            statusCode,
            duration,
          },
        );

        return throwError(() => error);
      }),
    );
  }

  private shouldSkipLogging(request: any): boolean {
    const skipPaths = ['/health', '/metrics'];
    return skipPaths.some((path) => request.url.startsWith(path));
  }
}
