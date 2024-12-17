import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Logger } from '../services/logger.service';
import { HttpContextUtils } from '../utils/http.utils';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalExceptionFilter');

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    // Get request context for logging
    const requestContext = HttpContextUtils.getRequestContext(request);

    // Determine status code and error message
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: requestContext.path,
      message,
      correlationId: requestContext.correlationId,
    };

    // Log the error with context
    if (exception instanceof Error) {
      this.logger.error(exception, {
        correlationId: requestContext.correlationId,
        userId: requestContext.userId,
        path: requestContext.path,
        method: requestContext.method,
        statusCode: status,
      });
    } else {
      this.logger.error('An unknown error occurred', {
        correlationId: requestContext.correlationId,
        userId: requestContext.userId,
        path: requestContext.path,
        method: requestContext.method,
        statusCode: status,
        error: exception,
      });
    }

    httpAdapter.reply(ctx.getResponse(), errorResponse, status);
  }
}
