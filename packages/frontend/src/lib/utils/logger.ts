import { LOGGER_CONFIG } from '../config/logger-config';
import { LogMetadata } from '../types/logger';
import type { Logger } from 'winston';

// Define interface for log info object
import type { TransformableInfo } from 'logform';

let winstonLogger: Logger | undefined;

// Initialize server-side Winston logger
if (typeof window === 'undefined') {
  const initializeServerLogger = async () => {
    const winston = (await import('winston')).default;
    const { default: LokiTransport } = await import('winston-loki');

    const prodFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format((info: TransformableInfo) => maskSensitiveData(info))(),
      winston.format.json(),
    );

    const lokiTransport = new LokiTransport({
      host: LOGGER_CONFIG.loki.host,
      labels: {
        app: LOGGER_CONFIG.service,
        environment: process.env.NEXT_PUBLIC_ENV || 'production',
      },
      json: true,
      format: prodFormat,
      replaceTimestamp: true,
      interval: LOGGER_CONFIG.loki.batchInterval,
      batching: true,
      onConnectionError: (error: Error) => {
        console.error('Loki connection error:', error);
      },
    });

    winstonLogger = winston.createLogger({
      level: 'info',
      format: prodFormat,
      defaultMeta: {
        service: LOGGER_CONFIG.service,
      },
      transports: [lokiTransport],
    });
  };

  // Initialize server logger
  initializeServerLogger().catch(console.error);
}

// Mask sensitive data in logs
export const maskSensitiveData = (info: TransformableInfo): TransformableInfo => {
  if (typeof info !== 'object' || info === null) {
    return info;
  }

  const masked = { ...info };

  const maskValue = (obj: Record<string, unknown>): void => {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        maskValue(obj[key] as Record<string, unknown>);
      } else if (typeof obj[key] === 'string') {
        if (LOGGER_CONFIG.sensitive.patterns.some(pattern => pattern.test(key))) {
          obj[key] = '***';
        }
      }
    }
  };

  maskValue(masked);
  return masked;
};

// Helper to format log message with metadata
const formatLogMessage = (message: string | Error, metadata?: LogMetadata): TransformableInfo => {
  const baseMetadata = {
    correlationId: metadata?.correlationId || crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };

  if (message instanceof Error) {
    return {
      message: message.message,
      level: (metadata?.level as string) || 'info',
      ...baseMetadata,
      error: {
        name: message.name,
        message: message.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : message.stack,
      },
    };
  }

  return {
    message,
    level: (metadata?.level as string) || 'info',
    ...baseMetadata,
  };
};

// Universal logger that works in both client and server
export const logger = {
  error: (message: string | Error, metadata?: LogMetadata): void => {
    const logData = formatLogMessage(message, { ...metadata, level: 'error' });
    if (typeof window === 'undefined' && winstonLogger) {
      // Server-side logging
      winstonLogger.error(logData.message as string, maskSensitiveData(logData));
    } else {
      // Client-side logging
      console.error(maskSensitiveData(logData));
    }
  },
  warn: (message: string, metadata?: LogMetadata): void => {
    const logData = formatLogMessage(message, { ...metadata, level: 'warn' });
    if (typeof window === 'undefined' && winstonLogger) {
      // Server-side logging
      winstonLogger.error(logData.message as string, maskSensitiveData(logData));
    } else {
      // Client-side logging
      console.warn(maskSensitiveData(logData));
    }
  },
  info: (message: string, metadata?: LogMetadata): void => {
    const logData = formatLogMessage(message, { ...metadata, level: 'info' });
    if (typeof window === 'undefined' && winstonLogger) {
      // Server-side logging
      winstonLogger.error(logData.message as string, maskSensitiveData(logData));
    } else {
      // Client-side logging
      console.log(maskSensitiveData(logData));
    }
  },
};
