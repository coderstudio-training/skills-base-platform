import { LOGGER_CONFIG } from '@/lib/config/logger-config';
import { LoggerInterface, LogLevel, LogMetadata } from '@/lib/types/logger';

class ClientLogger implements LoggerInterface {
  private async sendLog(level: LogLevel, message: string | Error, metadata?: LogMetadata) {
    try {
      const logData = {
        timestamp: new Date().toISOString(),
        level,
        message: message instanceof Error ? message.message : message,
        service: LOGGER_CONFIG.service,
        environment: 'client',
        ...this.sanitizeMetadata({
          ...metadata,
          error:
            message instanceof Error
              ? {
                  message: message.message,
                  stack: message.stack,
                  ...metadata?.error,
                }
              : metadata?.error,
        }),
      };

      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      });

      if (!response.ok) {
        console.error('Failed to send log to API:', await response.text());
      }
    } catch (error) {
      console.error('Error sending log:', error);
    }
  }

  private sanitizeMetadata(metadata: LogMetadata): LogMetadata {
    if (!metadata) return {};
    const sanitized = { ...metadata } as LogMetadata;
    const sensitivePatterns = LOGGER_CONFIG.sensitive.patterns;

    const sanitizeObject = (obj: unknown): Record<string, unknown> => {
      if (!obj || typeof obj !== 'object') {
        return {};
      }

      if (Array.isArray(obj)) {
        return { value: obj.map(item => sanitizeObject(item)) };
      }

      return Object.entries(obj as Record<string, unknown>).reduce(
        (acc, [key, value]) => {
          if (sensitivePatterns.some(pattern => pattern.test(key))) {
            acc[key] = '[REDACTED]';
          } else if (typeof value === 'object' && value !== null) {
            acc[key] = sanitizeObject(value);
          } else {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, unknown>,
      );
    };

    return sanitizeObject(sanitized) as LogMetadata;
  }

  error(message: string | Error, metadata?: LogMetadata): void {
    this.sendLog('error', message, metadata);
  }

  warn(message: string, metadata?: LogMetadata): void {
    this.sendLog('warn', message, metadata);
  }

  info(message: string, metadata?: LogMetadata): void {
    this.sendLog('info', message, metadata);
  }
}

export const clientLogger = new ClientLogger();
