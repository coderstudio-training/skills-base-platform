import { Injectable } from '@nestjs/common';
import { ELKLogBase, LogContext, LoggerOptions, LogLevel } from './types';
import { maskSensitiveData } from './utils/security';
import { ConfigurationManager } from './config';
import { ErrorTracker } from './utils/error-tracker';
import { writeToFile } from './utils/file-writer';
import * as os from 'os';
@Injectable()
export class Logger {
  private static readonly COLORS = {
    reset: '\x1b[0m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    gray: '\x1b[90m',
    magenta: '\x1b[35m',
  } as const;

  private static readonly LEVEL_COLORS: Record<
    LogLevel,
    keyof typeof Logger.COLORS
  > = {
    [LogLevel.ERROR]: 'red',
    [LogLevel.WARN]: 'yellow',
    [LogLevel.INFO]: 'blue',
    [LogLevel.DEBUG]: 'gray',
  } as const;

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
      format: config.format || 'pretty',
      outputs: config.outputs,
      filename: config.filename || 'app.log',
      maxSize: config.maxSize || 10 * 1024 * 1024,
      maxFiles: config.maxFiles || 5,
      sensitiveKeys: ['password', 'token', 'secret', 'authorization'],
      ...options,
    };

    this.isColorEnabled = process.env.NO_COLOR !== 'true';
    this.errorTracker = new ErrorTracker(this);
  }

  private color(color: keyof typeof Logger.COLORS, text: string): string {
    return this.isColorEnabled
      ? `${Logger.COLORS[color]}${text}${Logger.COLORS.reset}`
      : text;
  }

  private formatTimestamp(date: Date): string {
    return this.color('gray', date.toISOString().split('T')[1].split('.')[0]);
  }

  private formatLevel(level: LogLevel): string {
    return this.color(
      Logger.LEVEL_COLORS[level],
      level.toUpperCase().padEnd(5),
    );
  }

  private formatContextLine(
    key: string,
    value: any,
    indent: number = 0,
  ): string[] {
    const indentation = '   '.repeat(indent);
    const prefix = indent === 0 ? '└─ ' : '└─ ';

    if (typeof value === 'object' && value !== null) {
      const lines = [`${indentation}${prefix}${key}:`];
      return lines.concat(
        Object.entries(value).flatMap(([k, v]) =>
          this.formatContextLine(k, v, indent + 1),
        ),
      );
    }

    return [`${indentation}${prefix}${key}: ${value}`];
  }

  private formatError(error: Error): string[] {
    const lines = [`└─ type: ${error.name}`, `└─ message: ${error.message}`];

    if (error.stack) {
      lines.push('└─ stack:');
      error.stack
        .split('\n')
        .slice(1)
        .forEach((line) => {
          lines.push(`   ${line.trim()}`);
        });
    }

    return lines;
  }

  private formatContext(context: Record<string, any>): string[] {
    const priorityFields = ['type', 'method', 'path', 'statusCode', 'duration'];
    const skipFields = [
      'service',
      'timestamp',
      'correlationId',
      'isErrorTracking',
    ];
    const lines: string[] = [];

    if (context.errorTracking?.error) {
      delete context.errorTracking.error;
    }

    if (context.errorTracking?.context) {
      const trackingContext = context.errorTracking.context;
      const additionalInfo = {
        environment: trackingContext.environment,
      };
      delete context.errorTracking;
      Object.assign(context, additionalInfo);
    }

    priorityFields.forEach((field) => {
      if (field in context) {
        if (typeof context[field] === 'object' && context[field] !== null) {
          lines.push(`└─ ${field}:`);
          Object.entries(context[field]).forEach(([key, value]) => {
            lines.push(`   └─ ${key}: ${value}`);
          });
        } else {
          lines.push(`└─ ${field}: ${context[field]}`);
        }
      }
    });

    Object.entries(context)
      .filter(
        ([key]) => !priorityFields.includes(key) && !skipFields.includes(key),
      )
      .forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          lines.push(`└─ ${key}:`);
          Object.entries(value).forEach(([subKey, subValue]) => {
            if (typeof subValue === 'object' && subValue !== null) {
              lines.push(`   └─ ${subKey}:`);
              Object.entries(subValue).forEach(([subSubKey, subSubValue]) => {
                lines.push(`      └─ ${subSubKey}: ${subSubValue}`);
              });
            } else {
              lines.push(`   └─ ${subKey}: ${subValue}`);
            }
          });
        } else {
          lines.push(`└─ ${key}: ${value}`);
        }
      });

    return lines;
  }

  private formatLogForELK(
    level: LogLevel,
    message: string,
    error: Error | null,
    context: Partial<LogContext> = {},
  ): ELKLogBase {
    const timestamp = new Date().toISOString();

    const elkLog: ELKLogBase = {
      '@timestamp': timestamp,
      'log.level': level,
      message: message,
      'service.name': this.service,
      'service.type': 'application',
      'event.dataset': `${this.service}.application`,
      'event.module': context.type || 'default',
      'event.kind': 'event',
      labels: {
        environment: process.env.NODE_ENV || 'development',
        version: process.env.APP_VERSION || 'unknown',
      },
      trace: {
        id: context.traceId || null,
        correlation_id: context.correlationId || null,
      },
      host: {
        hostname: os.hostname(),
        architecture: process.arch,
        os: {
          platform: process.platform,
          version: process.version,
        },
      },
      process: {
        pid: process.pid,
        memory_usage: process.memoryUsage().heapUsed,
        uptime: process.uptime(),
      },
    };

    if (context.method && context.url) {
      elkLog.http = {
        request: {
          method: context.method,
          url: context.url,
        },
        response: {
          status_code: context.statusCode,
        },
      };
    }

    if (context.userId) {
      elkLog.user = {
        id: context.userId,
      };
    }

    if (error) {
      elkLog.error = {
        type: error.name,
        message: error.message,
        stack_trace: error.stack,
        code: (error as any).code || 'UNKNOWN_ERROR',
      };
    }

    if (context.duration) {
      elkLog['event.duration'] = context.duration;
    }

    if (context.custom) {
      elkLog.custom_fields = context.custom;
    }

    return elkLog;
  }

  private async log(
    level: LogLevel,
    message: string | Error,
    context: Partial<LogContext> = {},
  ) {
    if (!this.shouldLog(level)) {
      return;
    }

    const timestamp = new Date();
    const formattedMessage =
      message instanceof Error ? message.message : message;
    const error = message instanceof Error ? message : null;
    const correlationId = context.correlationId
      ? this.color('dim', `(${context.correlationId.slice(0, 8)})`)
      : '';

    // Handle console output
    if (this.options.outputs.includes('console')) {
      if (this.options.format === 'json') {
        const elkLog = this.formatLogForELK(
          level,
          formattedMessage,
          error,
          context,
        );
        const maskedLog = maskSensitiveData(elkLog, this.options.sensitiveKeys);
        console[level](JSON.stringify(maskedLog, null, 2));
      } else {
        const formattedTimestamp = this.formatTimestamp(timestamp);
        const formattedLevel = this.formatLevel(level);
        const baseLog = `${formattedTimestamp} ${formattedLevel} ${correlationId} ${formattedMessage}`;
        console.log(baseLog);

        if (error && level === LogLevel.ERROR) {
          console.log('Error Details:');
          console.log(this.formatError(error).join('\n'));
          console.log('');
        }

        const contextLines = this.formatContext(context);
        if (contextLines.length > 0) {
          console.log(contextLines.join('\n'));
        }
      }
    }

    // Handle file output (always in ELK format)
    if (this.options.outputs.includes('file')) {
      const elkLog = this.formatLogForELK(
        level,
        formattedMessage,
        error,
        context,
      );
      const maskedLog = maskSensitiveData(elkLog, this.options.sensitiveKeys);
      await writeToFile(JSON.stringify(maskedLog) + '\n', this.options);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    return levels.indexOf(level) <= levels.indexOf(this.options.level);
  }

  info(message: string, context?: Partial<LogContext>) {
    return this.log(LogLevel.INFO, message, context);
  }

  error(error: Error | string, context?: Partial<LogContext>) {
    if (typeof error === 'string') {
      return this.log(LogLevel.ERROR, new Error(error), context);
    }
    return this.log(LogLevel.ERROR, error, context);
  }

  warn(message: string, context?: Partial<LogContext>) {
    return this.log(LogLevel.WARN, message, context);
  }

  debug(message: string, context?: Partial<LogContext>) {
    return this.log(LogLevel.DEBUG, message, context);
  }

  async trackException(error: unknown, context?: Partial<LogContext>) {
    const trackingResult = await this.errorTracker.captureException(error, {
      ...context,
      service: this.service,
    });

    if (trackingResult) {
      await this.error(
        error instanceof Error ? error : new Error(String(error)),
        {
          ...context,
          errorTracking: trackingResult,
          isErrorTracking: true,
        },
      );
    }
  }
}
