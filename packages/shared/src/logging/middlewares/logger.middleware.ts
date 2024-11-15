import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '..';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const correlationId =
      req.headers['x-correlation-id']?.toString() || uuidv4();
    req.headers['x-correlation-id'] = correlationId;

    this.logRequest(req, correlationId);
    this.setupResponseLogging(req, res, startTime, correlationId);

    next();
  }

  private logRequest(req: Request, correlationId: string): void {
    this.logger.info(`Incoming request ${req.method}`, {
      correlationId,
    });
  }

  private setupResponseLogging(
    req: Request,
    res: Response,
    startTime: number,
    correlationId: string,
  ): void {
    const chunks: Buffer[] = [];

    const originalWrite = res.write;
    const originalEnd = res.end;

    res.write = this.createWriteInterceptor(originalWrite, chunks);
    res.end = this.createEndInterceptor(
      originalEnd,
      chunks,
      req,
      res,
      startTime,
      correlationId,
    );
  }

  private createWriteInterceptor(originalWrite: any, chunks: Buffer[]) {
    return function (chunk: any, ...args: any[]) {
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      return originalWrite.apply(this, [chunk, ...args]);
    };
  }

  private createEndInterceptor(
    originalEnd: any,
    chunks: Buffer[],
    req: Request,
    res: Response,
    startTime: number,
    correlationId: string,
  ) {
    return function (this: LoggerMiddleware, chunk: any, ...args: any[]) {
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }

      const body = Buffer.concat(chunks).toString('utf8');
      const duration = Date.now() - startTime;

      this.logResponse(req, res, body, duration, correlationId);

      return originalEnd.apply(res, [chunk, ...args]);
    }.bind(this);
  }

  private logResponse(
    req: Request,
    res: Response,
    body: string,
    duration: number,
    correlationId: string,
  ): void {
    this.logger.info(
      `Outgoing response ${req.method} ${req.path} ${res.statusCode}`,
      {
        correlationId,
      },
    );
  }
}
