import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseExceptionFilter } from './base-exception.filter';

@Catch(HttpException)
export class HttpExceptionFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  constructor() {
    super('HttpExceptionFilter');
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // Get error context and log the error
    // const errorContext = this.getErrorContext(host);
    // this.logError(exception, errorContext, status);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }
}
