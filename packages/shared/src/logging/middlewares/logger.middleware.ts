import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../logger';
import { Monitor } from '../monitor';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(
    private readonly logger: Logger,
    private readonly monitor: Monitor,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const correlationId =
      req.headers['x-correlation-id']?.toString() || uuidv4();
    req.headers['x-correlation-id'] = correlationId;

    // Log incoming request
    this.logger.info(`Incoming request ${req.method} ${req.originalUrl}`, {
      type: 'request.received',
      method: req.method,
      path: req.originalUrl,
      correlationId,
    });

    // Start monitoring
    this.monitor.trackRequest(req, res);

    // Handle response
    const originalEnd = res.end;
    res.end = function (...args: any[]) {
      const duration = Date.now() - startTime;

      // Log outgoing response with minimal details
      this.logger.info(
        `Outgoing response ${req.method} ${req.originalUrl} ${res.statusCode}`,
        {
          type: 'response.sent',
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
        },
      );

      // Track metrics
      this.monitor.trackMetric('network.response.time', duration);

      return originalEnd.apply(res, args);
    }.bind(this);

    next();
  }
}
