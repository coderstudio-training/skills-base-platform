import type { Logger, transport } from 'winston';
import { LOGGER_CONFIG } from '../config/logger-config';
import type { LogMetadata } from '../types/logger';
import { CustomLokiTransport } from './custom-loki-transport';

const isClient = typeof window !== 'undefined';

type LogData = Record<string, unknown>;

// Helper to mask sensitive data
const maskSensitiveData = (data: LogData): LogData => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const masked = { ...data };
  const maskValue = (obj: Record<string, unknown>): void => {
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === 'object' && value !== null) {
        maskValue(value as Record<string, unknown>);
      } else if (typeof value === 'string') {
        if (LOGGER_CONFIG.sensitive.patterns.some(pattern => pattern.test(key))) {
          obj[key] = '***';
        }
      }
    }
  };

  maskValue(masked);
  return masked;
};

// Simple client-side logger
const clientLogger = {
  error: (message: string | Error, metadata?: LogMetadata) => {
    const maskedMetadata = metadata ? maskSensitiveData(metadata) : metadata;
    if (message instanceof Error) {
      console.error('[Client]', message.message, {
        ...maskedMetadata,
        error: {
          name: message.name,
          stack: process.env.NODE_ENV === 'production' ? undefined : message.stack,
          message: message.message,
        },
      });
    } else {
      console.error('[Client]', message, maskedMetadata);
    }
  },
  warn: (message: string, metadata?: LogMetadata) => {
    const maskedMetadata = metadata ? maskSensitiveData(metadata) : metadata;
    console.warn('[Client]', message, maskedMetadata);
  },
  info: (message: string, metadata?: LogMetadata) => {
    const maskedMetadata = metadata ? maskSensitiveData(metadata) : metadata;
    console.log('[Client]', message, maskedMetadata);
  },
};

// Server-side logger initialization
const createServerLogger = () => {
  let winstonLogger: Logger | undefined;

  const initializeServerLogger = async () => {
    try {
      const winston = (await import('winston')).default;

      // Create console format (keep existing format)
      const consoleFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
        const maskedMetadata = maskSensitiveData(metadata as LogData);
        return `${timestamp} [${level.toUpperCase()}] ${message} ${
          Object.keys(maskedMetadata).length ? JSON.stringify(maskedMetadata) : ''
        }`;
      });

      const transports: transport[] = [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            consoleFormat,
          ),
        }),
      ];

      if (process.env.NODE_ENV === 'production') {
        try {
          const lokiTransport = new CustomLokiTransport({
            host: LOGGER_CONFIG.loki.host,
            labels: {
              app: LOGGER_CONFIG.service,
              environment: process.env.NEXT_PUBLIC_ENV || 'production',
            },
            interval: LOGGER_CONFIG.loki.batchInterval,
            timeout: LOGGER_CONFIG.loki.timeout,
          });

          lokiTransport.on('error', error => {
            console.error('Loki transport error:', error);
          });

          transports.push(lokiTransport as transport);
        } catch (error) {
          console.warn('Failed to initialize Loki transport:', error);
        }
      }

      winstonLogger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        defaultMeta: {
          service: LOGGER_CONFIG.service,
        },
        transports,
      });
    } catch (error) {
      console.error('Failed to initialize server logger:', error);
    }
  };

  initializeServerLogger();

  return {
    error: (message: string | Error, metadata?: LogMetadata) => {
      const maskedMetadata = metadata ? maskSensitiveData(metadata) : metadata;
      if (winstonLogger) {
        if (message instanceof Error) {
          winstonLogger.error(message.message, {
            ...maskedMetadata,
            error: {
              name: message.name,
              stack: process.env.NODE_ENV === 'production' ? undefined : message.stack,
              message: message.message,
            },
          });
        } else {
          winstonLogger.error(message, maskedMetadata);
        }
      } else {
        console.error('[Server]', message, maskedMetadata);
      }
    },
    warn: (message: string, metadata?: LogMetadata) => {
      const maskedMetadata = metadata ? maskSensitiveData(metadata) : metadata;
      if (winstonLogger) {
        winstonLogger.warn(message, maskedMetadata);
      } else {
        console.warn('[Server]', message, maskedMetadata);
      }
    },
    info: (message: string, metadata?: LogMetadata) => {
      const maskedMetadata = metadata ? maskSensitiveData(metadata) : metadata;
      if (winstonLogger) {
        winstonLogger.info(message, maskedMetadata);
      } else {
        console.log('[Server]', message, maskedMetadata);
      }
    },
  };
};

// Export the appropriate logger based on environment
export const logger = isClient ? clientLogger : createServerLogger();
