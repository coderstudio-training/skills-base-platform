// src/middlewares/logger.middleware.ts
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const requestId = uuidv4();
    const startTime = Date.now();

    // Log request details
    this.logger.log({
      message: 'Incoming request',
      requestId,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    // Add requestId to response headers
    res.setHeader('X-Request-ID', requestId);

    // Log response details after the request is processed
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      this.logger.log({
        message: 'Request completed',
        requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });
    });

    next();
  }
}
