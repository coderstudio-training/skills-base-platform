import { LOGGER_CONFIG } from '@/lib/config/logger-config';
import { LogMetadata } from '@/lib/types/logger';
import winston from 'winston';
import LokiTransport from 'winston-loki';
import { handleLokiError, maskSensitiveData } from './logger-utils';

// Create Winston logger for production
const createProductionLogger = () => {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  // Custom format for production
  const productionFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format(info => {
      // Mask sensitive data
      const masked = maskSensitiveData(info);

      // Add required production metadata
      masked.environment = process.env.NEXT_PUBLIC_ENV || 'production';
      masked.version = process.env.NEXT_PUBLIC_VERSION;
      masked.nodeVersion = process.version;

      return masked;
    })(),
    winston.format.json(),
  );

  return winston.createLogger({
    level: 'info', // Only info and above in production
    format: productionFormat,
    defaultMeta: {
      service: LOGGER_CONFIG.service,
    },
    transports: [
      new LokiTransport({
        host: LOGGER_CONFIG.loki.host,
        labels: {
          app: LOGGER_CONFIG.service,
          environment: process.env.NEXT_PUBLIC_ENV || 'production',
          version: process.env.NEXT_PUBLIC_VERSION || 'unknown',
        },
        json: true,
        format: productionFormat,
        replaceTimestamp: true,
        interval: LOGGER_CONFIG.loki.batchInterval,
        batching: true,
        clearOnError: false,
        onConnectionError: handleLokiError,
      }),
    ],
    exceptionHandlers: [
      new winston.transports.File({ filename: '/var/log/frontend/exceptions.log' }),
    ],
    rejectionHandlers: [
      new winston.transports.File({ filename: '/var/log/frontend/rejections.log' }),
    ],
  });
};

const productionLogger = createProductionLogger();

// Production-safe logger implementation
export const logger = {
  error: (message: string | Error, metadata?: LogMetadata): void => {
    if (!productionLogger) return;

    const errorMeta = {
      ...metadata,
      correlationId: metadata?.correlationId || crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      severity: 'ERROR',
    };

    if (message instanceof Error) {
      errorMeta.error = {
        name: message.name,
        message: message.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : message.stack,
      };
    }

    productionLogger.error(typeof message === 'string' ? message : message.message, errorMeta);
  },

  warn: (message: string, metadata?: LogMetadata): void => {
    if (!productionLogger) return;

    productionLogger.warn(message, {
      ...metadata,
      correlationId: metadata?.correlationId || crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      severity: 'WARN',
    });
  },

  info: (message: string, metadata?: LogMetadata): void => {
    if (!productionLogger) return;

    productionLogger.info(message, {
      ...metadata,
      correlationId: metadata?.correlationId || crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      severity: 'INFO',
    });
  },

  // Debug is disabled in production
  debug: (): void => {},
};
