import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Logger } from '..';

interface RequestContext {
  method: string;
  path: string;
  correlationId?: string;
  userId?: string;
  userAgent?: string;
  ip?: string;
  query?: Record<string, any>;
  params?: Record<string, any>;
  body?: Record<string, any>;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}

  private getRequestContext(request: Request): RequestContext {
    return {
      method: request.method,
      path: this.normalizePath(request.originalUrl || request.url),
      correlationId: request.headers['x-correlation-id']?.toString(),
      userId: (request.user as any)?.id,
      userAgent: request.get('user-agent'),
      ip: request.ip,
      query: request.query,
      params: request.params,
    };
  }

  private normalizePath(path: string): string {
    return path
      .replace(/\/\d+/g, '/:id')
      .replace(
        /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
        '/:uuid',
      )
      .split('?')[0];
  }

  private getResponseSize(res: Response): number {
    const contentLength = res.getHeader('content-length');
    return contentLength ? parseInt(contentLength.toString(), 10) : 0;
  }

  private formatError(error: Error | HttpException): Record<string, any> {
    const errorInfo: Record<string, any> = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };

    if (error instanceof HttpException) {
      errorInfo.status = error.getStatus();
      errorInfo.response = error.getResponse();
    }

    return errorInfo;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const requestContext = this.getRequestContext(request);

    // Log incoming request
    this.logger.info(
      `Incoming ${requestContext.method} ${requestContext.path}`,
      {
        type: 'request.incoming',
        ...requestContext,
        timestamp: new Date().toISOString(),
      },
    );

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;
        const responseSize = this.getResponseSize(response);

        // Log successful response
        this.logger.info(
          `Completed ${requestContext.method} ${requestContext.path}`,
          {
            type: 'request.complete',
            ...requestContext,
            statusCode,
            duration,
            responseSize,
            timestamp: new Date().toISOString(),
          },
        );
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode =
          error instanceof HttpException ? error.getStatus() : 500;

        // Log error response
        this.logger.error(
          `Error processing ${requestContext.method} ${requestContext.path}`,
          {
            type: 'request.error',
            ...requestContext,
            error: this.formatError(error),
            statusCode,
            duration,
            timestamp: new Date().toISOString(),
          },
        );

        throw error;
      }),
    );
  }
}
