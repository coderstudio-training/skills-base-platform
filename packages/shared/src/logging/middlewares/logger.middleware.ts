import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Logger } from '../';
import { RequestContext, ResponseContext } from '../types';
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
      ...context,
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

    this.logger[logLevel](
      `Completed ${context.method} ${context.path} ${statusCode} ${duration}ms`,
      {
        type: 'request.complete',
        ...context,
      },
    );
  }
}
