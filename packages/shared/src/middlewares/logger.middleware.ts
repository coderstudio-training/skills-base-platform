import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import {
  RequestContext,
  ResponseContext,
} from '../interfaces/logging.interfaces';
import { Logger } from '../services/logger.service';
import { HttpContextUtils } from '../utils/http.utils';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const requestContext = HttpContextUtils.getRequestContext(req);

    // Ensure correlation ID is set in request headers
    req.headers['x-correlation-id'] = requestContext.correlationId;

    // Log incoming request
    this.logRequest(requestContext);

    // Intercept response
    this.interceptResponse(req, res, startTime, requestContext);

    next();
  }

  private logRequest(context: RequestContext): void {
    this.logger.info(`Incoming ${context.method} ${context.path}`, {
      type: 'request.incoming',
      correlationId: context.correlationId,
      incoming_from: `${context.ip} - ${context.userAgent}`,
    });
  }

  private interceptResponse(
    req: Request,
    res: Response,
    startTime: number,
    requestContext: RequestContext,
  ): void {
    const chunks: Buffer[] = [];

    // Intercept write operations to calculate response size
    res.write = new Proxy(res.write, {
      apply: (target, thisArg, args) => {
        const chunk = args[0];
        if (chunk) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        return Reflect.apply(target, thisArg, args);
      },
    });

    // Intercept end operation to log response
    res.end = new Proxy(res.end, {
      apply: (target, thisArg, args) => {
        const chunk = args[0];
        if (chunk) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }

        const duration = Date.now() - startTime;
        const responseSize = Buffer.concat(chunks).length;

        this.logResponse({
          ...requestContext,
          statusCode: res.statusCode,
          duration,
          responseSize,
        });

        return Reflect.apply(target, thisArg, args);
      },
    });
  }

  private logResponse(context: ResponseContext): void {
    const { statusCode, duration } = context;
    const logLevel =
      statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    let message: string;
    if (statusCode >= 500) {
      message = `Failed ${context.method} ${context.path} with server error`;
    } else if (statusCode >= 400) {
      message = `Failed ${context.method} ${context.path} with client error`;
    } else if (statusCode >= 300) {
      message = `Redirected ${context.method} ${context.path}`;
    } else {
      message = `Successful ${context.method} ${context.path}`;
    }

    this.logger[logLevel](`${message} ${statusCode} ${duration}ms`, {
      type: 'request.complete',
      correlationId: context.correlationId,
      responseSize: context.responseSize,
    });
  }
}
