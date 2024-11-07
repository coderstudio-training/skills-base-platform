// logger.ts
import { Injectable } from '@nestjs/common';
import { LogContext, LoggerOptions, LogLevel } from './types';
import { writeToFile } from './utils/formatter';
import { maskSensitiveData } from './utils/security';
import { ConfigurationManager } from './config';
import { ErrorTracker } from './utils/error-tracker';

@Injectable()
export class Logger {
  // ANSI escape codes for basic colors
  private static readonly COLORS = {
    reset: '\x1b[0m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    gray: '\x1b[90m',
  };

  private readonly options: Required<LoggerOptions>;
  private readonly errorTracker: ErrorTracker;
  private readonly isColorEnabled: boolean;
  constructor(
    private readonly service: string,
    options: LoggerOptions = {},
  ) {
    const config = ConfigurationManager.getInstance().getLoggerConfig();
    this.options = {
      level: config.level,
      format: config.format,
      outputs: config.outputs,
      filename: config.filename || 'app.log',
      maxSize: config.maxSize || 10 * 1024 * 1024,
      maxFiles: config.maxFiles || 5,
      sensitiveKeys: ['password', 'token', 'secret', 'authorization'],
      ...options,
    };

    this.isColorEnabled = true;
    this.errorTracker = new ErrorTracker(this);
  }

  private color(color: keyof typeof Logger.COLORS, text: string): string {
    if (!this.isColorEnabled) return text;
    return `${Logger.COLORS[color]}${text}${Logger.COLORS.reset}`;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[1].split('.')[0];
  }

  private formatLevel(level: LogLevel): string {
    const levelColors: Record<LogLevel, keyof typeof Logger.COLORS> = {
      [LogLevel.ERROR]: 'red',
      [LogLevel.WARN]: 'yellow',
      [LogLevel.INFO]: 'blue',
      [LogLevel.DEBUG]: 'gray',
    };

    const paddedLevel = level.toUpperCase().padEnd(5);
    return this.color(levelColors[level] || 'reset', paddedLevel);
  }

  private formatContext(context: any): string[] {
    const lines: string[] = [];

    if (context.method && context.path) {
      const status = context.statusCode
        ? ` ${this.color(context.statusCode < 400 ? 'green' : 'red', context.statusCode)}`
        : '';
      const duration = context.duration
        ? ` ${this.color('yellow', `${context.duration}ms`)}`
        : '';
      lines.push(`└─ ${context.method} ${context.path}${status}${duration}`);
    }

    if (context.headers) {
      lines.push('   Headers:');
      for (const [key, value] of Object.entries(context.headers)) {
        const displayValue = this.options.sensitiveKeys.includes(
          key.toLowerCase(),
        )
          ? '[REDACTED]'
          : value;
        lines.push(`   └─ ${key}: ${displayValue}`);
      }
    }

    if (context.error) {
      lines.push(`   Error: ${context.error.message}`);
      if (context.error.stack) {
        const stack = context.error.stack
          .split('\n')
          .slice(1)
          .map((line: string) => `   ${line.trim()}`)
          .join('\n');
        lines.push(this.color('gray', stack));
      }
    }

    return lines;
  }

  private formatConsoleOutput(
    level: LogLevel,
    message: string,
    context: any,
  ): string {
    const timestamp = this.color(
      'gray',
      this.formatDate(new Date(context.timestamp)),
    );
    const levelStr = this.formatLevel(level);
    const correlationId = context.correlationId
      ? this.color('dim', `(${context.correlationId.slice(0, 8)})`)
      : '';

    const lines = [
      `${timestamp} ${levelStr} ${correlationId} ${message}`,
      ...this.formatContext(context),
    ];

    return lines.join('\n');
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

    if (this.options.outputs.includes('console')) {
      if (this.options.format === 'json') {
        console[level](JSON.stringify(maskedData));
      } else {
        console.log(
          this.formatConsoleOutput(
            level,
            maskedData.message,
            maskedData.context,
          ),
        );
      }
    }

    // Always save as JSON in file for machine parsing
    if (this.options.outputs.includes('file')) {
      await writeToFile(JSON.stringify(maskedData) + '\n', this.options);
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
