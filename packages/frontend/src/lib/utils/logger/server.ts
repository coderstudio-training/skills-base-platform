import { LOGGER_CONFIG } from '@/lib/config/logger-config';
import { LoggerInterface, LogMetadata } from '@/lib/types/logger';
import winston from 'winston';
import type Transport from 'winston-transport';

interface LokiTransportOptions {
  host: string;
  json: boolean;
  labels: Record<string, string>;
  format: winston.Logform.Format;
  replaceTimestamp: boolean;
  interval: number;
  timeout: number;
  batching: boolean;
  onConnectionError: (err: Error) => void;
}

// Using module-level variables for better build-time stability
let loggerInstance: ServerLogger | null = null;
let initializationPromise: Promise<ServerLogger> | null = null;

class ServerLogger implements LoggerInterface {
  private logger: winston.Logger;
  private lokiTransport: Transport | null = null;
  private isLokiInitialized = false;

  private constructor() {
    // Create logger with just console transport initially
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message, ...metadata }) => {
              return `${timestamp} [${level}]: ${message} ${
                Object.keys(metadata).length ? JSON.stringify(metadata, null, 2) : ''
              }`;
            }),
          ),
        }),
      ],
    });
  }

  private static createInstance(): ServerLogger {
    if (!loggerInstance) {
      loggerInstance = new ServerLogger();
    }
    return loggerInstance;
  }

  public static getInstance(): Promise<ServerLogger> {
    if (loggerInstance) {
      return Promise.resolve(loggerInstance);
    }

    if (!initializationPromise) {
      initializationPromise = (async () => {
        const instance = ServerLogger.createInstance();

        // Only initialize Loki in runtime environment, not during build
        if (
          typeof window === 'undefined' &&
          LOGGER_CONFIG.loki.host &&
          process.env.NODE_ENV !== 'production'
        ) {
          await instance.initializeLokiTransport();
        }

        return instance;
      })();
    }

    return initializationPromise;
  }

  private async initializeLokiTransport() {
    if (this.isLokiInitialized || !LOGGER_CONFIG.loki.host) {
      return;
    }

    try {
      this.isLokiInitialized = true;

      // Dynamic import of winston-loki to prevent build issues
      const lokiModule = await import('winston-loki').catch(err => {
        console.warn('Failed to load winston-loki module:', err);
        return null;
      });

      if (!lokiModule) {
        return;
      }

      const LokiTransport = (lokiModule.default || lokiModule) as TransportConstructor;

      if (typeof LokiTransport !== 'function') {
        throw new Error('LokiTransport import failed - not a constructor');
      }

      const options: LokiTransportOptions = {
        host: LOGGER_CONFIG.loki.host,
        json: true,
        labels: { service: LOGGER_CONFIG.service },
        format: winston.format.json(),
        replaceTimestamp: true,
        interval: LOGGER_CONFIG.loki.batchInterval,
        timeout: LOGGER_CONFIG.loki.timeout,
        batching: false,
        onConnectionError: (err: Error) => {
          console.error('Loki connection error:', err);
        },
      };

      this.lokiTransport = new LokiTransport(options);
      this.logger.add(this.lokiTransport);
      console.info('Successfully initialized Loki transport.');
    } catch (error) {
      this.isLokiInitialized = false;
      console.error('Failed to initialize Loki transport:', error);
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
    const sanitizedMetadata = this.sanitizeMetadata(metadata || {});
    if (message instanceof Error) {
      this.logger.error(message.message, {
        ...sanitizedMetadata,
        error: {
          message: message.message,
          stack: message.stack,
          ...sanitizedMetadata.error,
        },
      });
    } else {
      this.logger.error(message, sanitizedMetadata);
    }
  }

  warn(message: string, metadata?: LogMetadata): void {
    this.logger.warn(message, this.sanitizeMetadata(metadata || {}));
  }

  info(message: string, metadata?: LogMetadata): void {
    this.logger.info(message, this.sanitizeMetadata(metadata || {}));
  }
}

// For type safety
type TransportConstructor = {
  new (options: LokiTransportOptions): Transport;
};

// Export a function that always returns a promise
export async function getServerLogger(): Promise<ServerLogger> {
  return ServerLogger.getInstance();
}

// For backward compatibility and direct access
export const serverLogger = ServerLogger.getInstance();
