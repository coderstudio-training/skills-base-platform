import { Injectable } from '@nestjs/common';
import { LogContext, LoggerOptions, LogLevel } from './types';
import { formatLogMessage, writeToFile } from './utils/formatter';
import { maskSensitiveData } from './utils/security';

@Injectable()
export class Logger {
  private readonly options: Required<LoggerOptions>;

  constructor(
    private readonly service: string,
    options: LoggerOptions = {},
  ) {
    this.options = {
      level: LogLevel.INFO,
      format: 'json',
      outputs: ['console'],
      filename: 'app.log',
      maxSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      sensitiveKeys: ['password', 'token', 'secret'],
      ...options,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    return levels.indexOf(level) <= levels.indexOf(this.options.level);
  }

  private async log(
    level: LogLevel,
    message: string | Error,
    context: Partial<LogContext> = {},
  ) {
    if (!this.shouldLog(level)) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logData = {
      level,
      message: message instanceof Error ? message.message : message,
      stack: message instanceof Error ? message.stack : undefined,
      context: {
        service: this.service,
        timestamp,
        ...context,
      },
    };

    const maskedData = maskSensitiveData(logData, this.options.sensitiveKeys);
    const formattedLog = formatLogMessage(maskedData, this.options.format);

    if (this.options.outputs.includes('console')) {
      console[level](formattedLog);
    }

    if (this.options.outputs.includes('file')) {
      await writeToFile(formattedLog, this.options);
    }
  }

  info(message: string, context?: Partial<LogContext>) {
    return this.log(LogLevel.INFO, message, context);
  }

  error(error: Error | string, context?: Partial<LogContext>) {
    return this.log(LogLevel.ERROR, error, context);
  }

  warn(message: string, context?: Partial<LogContext>) {
    return this.log(LogLevel.WARN, message, context);
  }

  debug(message: string, context?: Partial<LogContext>) {
    return this.log(LogLevel.DEBUG, message, context);
  }
}
