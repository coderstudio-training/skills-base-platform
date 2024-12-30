import winston from 'winston';
import LokiTransport from 'winston-loki';
import { LOGGER_CONFIG } from '../config/logger-config';
import { LogLevel, LogMetadata } from '../types/logger';
import { handleLokiError, maskSensitiveData } from './logger-utils';

interface ProductionMetadata extends LogMetadata {
  environment: string;
  version: string;
  nodeVersion: string;
  severity: Uppercase<LogLevel>;
}

const createProductionLogger = (): winston.Logger | null => {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  const productionFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format((info: winston.Logform.TransformableInfo) => {
      const masked = maskSensitiveData(info);

      return {
        ...masked,
        environment: process.env.NEXT_PUBLIC_ENV || 'production',
        version: process.env.NEXT_PUBLIC_VERSION,
        nodeVersion: process.version,
      } as winston.Logform.TransformableInfo;
    })(),
    winston.format.json(),
  );

  return winston.createLogger({
    level: 'info',
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

export const logger = {
  error: (message: string | Error, metadata?: Partial<LogMetadata>): void => {
    if (!productionLogger) return;

    const errorMeta: ProductionMetadata = {
      ...(metadata as LogMetadata),
      correlationId: metadata?.correlationId || crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      severity: 'ERROR',
      type: metadata?.type || 'error',
      environment: process.env.NEXT_PUBLIC_ENV || 'production',
      version: process.env.NEXT_PUBLIC_VERSION || 'unknown',
      nodeVersion: process.version,
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

  warn: (message: string, metadata?: Partial<LogMetadata>): void => {
    if (!productionLogger) return;

    const warnMeta: ProductionMetadata = {
      ...(metadata as LogMetadata),
      correlationId: metadata?.correlationId || crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      severity: 'WARN',
      type: metadata?.type || 'warning',
      environment: process.env.NEXT_PUBLIC_ENV || 'production',
      version: process.env.NEXT_PUBLIC_VERSION || 'unknown',
      nodeVersion: process.version,
    };

    productionLogger.warn(message, warnMeta);
  },

  info: (message: string, metadata?: Partial<LogMetadata>): void => {
    if (!productionLogger) return;

    const infoMeta: ProductionMetadata = {
      ...(metadata as LogMetadata),
      correlationId: metadata?.correlationId || crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      severity: 'INFO',
      type: metadata?.type || 'info',
      environment: process.env.NEXT_PUBLIC_ENV || 'production',
      version: process.env.NEXT_PUBLIC_VERSION || 'unknown',
      nodeVersion: process.version,
    };

    productionLogger.info(message, infoMeta);
  },

  // Debug is disabled in production
  debug: (): void => {},
};
