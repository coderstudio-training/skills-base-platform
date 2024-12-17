import { Injectable } from '@nestjs/common';
import * as os from 'os';
import * as winston from 'winston';
import { ConfigurationManager } from '../config/logging.config';
import {
  LogContext,
  WinstonLoggerConfig,
} from '../interfaces/logging.interfaces';
import { createConsoleTransport } from '../transports/console.transport';
import { createFileTransport } from '../transports/file.transport';
import { createLokiTransport } from '../transports/loki.transport';
import { ErrorTracker } from '../utils/error-tracker.util';
import { maskSensitiveData } from '../utils/logging.security.util';
import { StringUtils } from '../utils/string.utils';

@Injectable()
export class Logger {
  private logger: winston.Logger;
  private static globalService: string = 'unknown-service';
  private readonly errorTracker: ErrorTracker;

  constructor(
    private readonly job: string,
    private config = ConfigurationManager.getInstance().getLoggerConfig(),
  ) {
    this.job = job;
    this.errorTracker = new ErrorTracker();
    this.logger = this.createLogger();
  }

  static setGlobalService(service: string) {
    if (!service) {
      throw new Error('Service name cannot be empty');
    }
    Logger.globalService = StringUtils.validateServiceName(service);
  }

  static getGlobalService(): string {
    return Logger.globalService;
  }

  private createBaseMetadata(): winston.Logform.Format {
    return winston.format((info) => ({
      ...info,
      service: Logger.globalService,
      job: this.job,
      hostname: os.hostname(),
      pid: process.pid,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || 'unknown',
    }))();
  }

  private createErrorFormat(): winston.Logform.Format {
    return winston.format((info) => {
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
  }

  private createMaskSecretsFormat(): winston.Logform.Format {
    return winston.format((info) => {
      const { sensitiveKeys = [] } = this.config;
      return maskSensitiveData(info, sensitiveKeys);
    })();
  }

  private createLogger(): winston.Logger {
    const baseMetadata = this.createBaseMetadata();
    const errorFormat = this.createErrorFormat();
    const maskSecrets = this.createMaskSecretsFormat();

    const transports: winston.transport[] = [];

    // Add console transport if configured
    if (this.config.outputs.includes('console')) {
      transports.push(createConsoleTransport(this.config));
    }

    // Add file transport if configured
    if (this.config.outputs.includes('file') && this.config.file) {
      transports.push(
        createFileTransport(
          this.config,
          baseMetadata,
          errorFormat,
          maskSecrets,
        ),
      );
    }

    // Add Loki transport if not in test environment
    if (this.config.outputs.includes('loki')) {
      transports.push(
        createLokiTransport({
          service: Logger.globalService,
          job: this.job,
        }),
      );
    }

    return winston.createLogger({
      level: this.config.level,
      defaultMeta: {
        service: Logger.globalService,
        job: this.job,
      },
      transports,
    });
  }

  private formatContext(
    context: Partial<LogContext> = {},
  ): Record<string, any> {
    const { correlationId, userId, traceId, ...rest } = context;

    // Create formatted context with standard fields
    const formattedContext: Record<string, any> = {
      ...rest,
      service: Logger.globalService,
      correlationId,
      userId,
      traceId,
      job: this.job,
      timestamp: new Date().toISOString(),
    };

    // Remove undefined values
    return Object.fromEntries(
      Object.entries(formattedContext).filter(
        ([, value]) => value !== undefined,
      ),
    );
  }

  info(message: string, context?: Partial<LogContext>) {
    this.logger.info(message, this.formatContext(context));
  }

  error(error: Error | string, context?: Partial<LogContext>) {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    const formattedContext = this.formatContext(context);

    // Only track and include error context if we have a proper Error object
    if (error instanceof Error) {
      const trackingInfo = this.errorTracker.captureException(errorObj, {
        ...context,
        service: Logger.globalService,
        job: this.job,
      });

      this.logger.error(errorObj.message, {
        ...formattedContext,
        error: errorObj,
        errorTracking: {
          error: {
            name: trackingInfo.name,
            message: trackingInfo.message,
            code: trackingInfo.code,
          },
          context: trackingInfo.context,
          timestamp: trackingInfo.timestamp,
        },
      });
    } else {
      // For string errors, just log the message without error tracking
      this.logger.error(errorObj.message, formattedContext);
    }
  }

  warn(message: string, context?: Partial<LogContext>) {
    this.logger.warn(message, this.formatContext(context));
  }

  debug(message: string, context?: Partial<LogContext>) {
    this.logger.debug(message, this.formatContext(context));
  }

  // Method to update logger configuration at runtime
  updateConfig(newConfig: Partial<WinstonLoggerConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.logger = this.createLogger();
  }

  // Method to get current logger configuration
  getConfig(): WinstonLoggerConfig {
    return { ...this.config };
  }
}
