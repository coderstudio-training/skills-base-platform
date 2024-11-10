import { Injectable } from '@nestjs/common';
import * as os from 'os';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as Transport from 'winston-transport';
import { ConfigurationManager } from './config';
import { createConsoleFormat, createJsonFormat } from './format';
import { LokiTransport } from './transports/loki.transport';
import { LogContext } from './types';
import { ErrorTracker } from './utils/error-tracker';
import { maskSensitiveData } from './utils/security';

@Injectable()
export class Logger {
  private logger: winston.Logger;
  private readonly service: string;
  private readonly errorTracker: ErrorTracker;

  constructor(
    service: string,
    private readonly config = ConfigurationManager.getInstance().getLoggerConfig(),
  ) {
    this.service = service;
    this.errorTracker = new ErrorTracker(this);
    this.logger = this.createLogger();
  }

  private createLogger(): winston.Logger {
    const { format } = winston;

    // Custom format for adding service and host information
    const baseMetadata = format((info) => ({
      ...info,
      service: this.service,
      hostname: os.hostname(),
      pid: process.pid,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || 'unknown',
    }))();

    // Create format for masking sensitive data
    const maskSecrets = format((info) => {
      return maskSensitiveData(info, this.config.sensitiveKeys || []);
    })();

    // Custom format for error handling
    const errorFormat = format((info) => {
      if (info.error instanceof Error) {
        return {
          ...info,
          error: {
            name: info.error.name,
            message: info.error.message,
            stack: info.error.stack,
            code: (info.error as any).code,
          },
        };
      }
      return info;
    })();

    // Configure transports based on config
    const transports: Transport[] = [];

    // Console transport with custom formatting
    if (this.config.outputs.includes('console')) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            createConsoleFormat(),
          ),
          level: this.config.level,
        }),
      );
    }

    // File transport with rotation
    if (this.config.outputs.includes('file') && this.config.file) {
      const fileTransport = new winston.transports.DailyRotateFile({
        dirname: this.config.file.path,
        filename: this.config.file.namePattern,
        datePattern: this.config.file.rotatePattern,
        zippedArchive: this.config.file.compress,
        maxSize: this.config.maxSize,
        maxFiles: this.config.maxFiles,
        format: createJsonFormat(baseMetadata, errorFormat, maskSecrets),
        level: this.config.level,
      });

      transports.push(fileTransport);
    }

    if (process.env.NODE_ENV !== 'test') {
      transports.push(
        new LokiTransport({
          host: process.env.LOKI_HOST || 'http://localhost:3100',
          labels: {
            environment: process.env.NODE_ENV || 'development',
            service: this.service,
            host: os.hostname(),
          },
        }),
      );
    }

    return winston.createLogger({
      level: this.config.level,
      defaultMeta: {
        service: this.service,
      },
      transports,
    });
  }

  private formatContext(
    context: Partial<LogContext> = {},
  ): Record<string, any> {
    const { correlationId, userId, traceId, ...rest } = context;

    const formattedContext: Record<string, any> = {
      ...rest,
      correlationId,
      userId,
      traceId,
    };

    // Remove undefined values
    Object.keys(formattedContext).forEach((key) => {
      if (formattedContext[key] === undefined) {
        delete formattedContext[key];
      }
    });

    return formattedContext;
  }

  info(message: string, context?: Partial<LogContext>) {
    this.logger.info(message, this.formatContext(context));
  }

  error(error: Error | string, context?: Partial<LogContext>) {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    this.logger.error(errorObj.message, {
      ...this.formatContext(context),
      error: errorObj,
    });
  }

  warn(message: string, context?: Partial<LogContext>) {
    this.logger.warn(message, this.formatContext(context));
  }

  debug(message: string, context?: Partial<LogContext>) {
    this.logger.debug(message, this.formatContext(context));
  }

  async trackException(error: unknown, context?: Partial<LogContext>) {
    const trackingResult = await this.errorTracker.captureException(error, {
      ...context,
      service: this.service,
    });

    if (trackingResult) {
      const normalizedError =
        error instanceof Error ? error : new Error(String(error));

      this.logger.error(normalizedError.message, {
        ...this.formatContext(context),
        error: normalizedError,
        errorTracking: trackingResult,
        isErrorTracking: true,
      });
    }
  }
}
