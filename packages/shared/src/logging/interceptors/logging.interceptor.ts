import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Logger } from '../logger';
import { Monitor } from '../monitor';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: Logger,
    private readonly monitor: Monitor,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const correlationId = request.headers['x-correlation-id']?.toString();

    // Log business operation start
    const { method, url, body, query, params, user } = request;
    this.logger.info(`Processing ${method} ${url}`, {
      correlationId,
      type: 'operation.start',
      operation: {
        method,
        url,
        controller: context.getClass().name,
        handler: context.getHandler().name,
        params,
        query,
        user,
        body,
      },
    });

    // Start operation timer
    const timer = this.monitor.startTimer(`operation.${method.toLowerCase()}`);

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;

        // Log successful operation completion with business metrics
        this.logger.info(`Completed ${method} ${url}`, {
          correlationId,
          type: 'operation.complete',
          duration,
          operation: {
            method,
            url,
            statusCode: response.statusCode,
            resultCount: Array.isArray(data) ? data.length : undefined,
            affectedRecords: data?.affected || data?.modifiedCount,
          },
        });

        // Track business metrics
        timer.end();
        this.monitor.trackMetric('operation.duration', duration, {
          controller: context.getClass().name,
          handler: context.getHandler().name,
          status: 'success',
        });

        if (Array.isArray(data)) {
          this.monitor.trackMetric('operation.result.count', data.length, {
            controller: context.getClass().name,
            handler: context.getHandler().name,
          });
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode =
          error instanceof HttpException ? error.getStatus() : 500;

        // Log operation error with details
        this.logger.error(error, {
          correlationId,
          type: 'operation.error',
          duration,
          operation: {
            method,
            url,
            statusCode,
            controller: context.getClass().name,
            handler: context.getHandler().name,
          },
        });

        // Track error metrics
        timer.end();
        this.monitor.trackMetric('operation.duration', duration, {
          controller: context.getClass().name,
          handler: context.getHandler().name,
          status: 'error',
          errorType: error.name,
        });

        throw error;
      }),
    );
  }
}
