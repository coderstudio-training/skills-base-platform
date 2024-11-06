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
    const correlationId =
      req.headers['x-correlation-id']?.toString() || uuidv4();
    const startTime = Date.now();

    // Add correlation ID to request headers
    req.headers['x-correlation-id'] = correlationId;

    this.logger.info('Request started', {
      correlationId,
      method: req.method,
      path: req.url,
      headers: req.headers,
    });

    this.monitor.trackRequest(req, res);

    res.on('finish', () => {
      const duration = Date.now() - startTime;

      this.logger.info('Request completed', {
        correlationId,
        method: req.method,
        path: req.url,
        statusCode: res.statusCode,
        duration,
      });
    });

    next();
  }
}
