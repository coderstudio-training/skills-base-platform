import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Logger } from '../';
import {
  RequestContext,
  ResponseContext,
} from '../interfaces/logging.interfaces';
import { HttpContextUtils } from '../utils/http.utils';

@Injectable()
export class LoggingInterceptor {
  constructor(private readonly logger: Logger) {}

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
      tap(() => this.logSuccess(requestContext, response, startTime)),
      catchError((error) => this.logError(error, requestContext, startTime)),
    );
  }

  private shouldSkipLogging(request: Request): boolean {
    const skipPaths = ['/health', '/metrics'];
    return skipPaths.some((path) => request.url.startsWith(path));
  }

  private logSuccess(
    requestContext: RequestContext,
    response: Response,
    startTime: number,
  ): void {
    const duration = Date.now() - startTime;
    const responseSize = HttpContextUtils.getResponseSize(response);

    const context: ResponseContext = {
      ...requestContext,
      statusCode: response.statusCode,
      duration,
      responseSize,
    };

    this.logger.info(
      `Processed ${context.method} ${context.path} ${context.statusCode} ${duration}ms`,
      {
        type: 'request.processed',
        correlationId: context.correlationId,
      },
    );
  }

  private logError(
    error: Error,
    requestContext: RequestContext,
    startTime: number,
  ): Observable<never> {
    const duration = Date.now() - startTime;
    const statusCode = error instanceof HttpException ? error.getStatus() : 500;

    const context: ResponseContext = {
      ...requestContext,
      statusCode,
      duration,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
      },
    };

    this.logger.error(
      `Error processing ${context.method} ${context.path} ${statusCode} ${duration}ms`,
      {
        type: 'request.error',
        ...context,
      },
    );

    return throwError(() => error);
  }
}
