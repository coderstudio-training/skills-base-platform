export interface LogMetadata {
  correlationId?: string;
  userId?: string;
  error?: {
    code?: string;
    status?: number;
    message?: string;
  };
  [key: string]: unknown;
}

export type LogLevel = 'error' | 'warn' | 'info';

// config/logger-config.ts
export const LOGGER_CONFIG = {
  service: 'frontend',
  loki: {
    host: process.env.NEXT_PUBLIC_LOKI_HOST || 'http://loki:3100',
    batchInterval: 5000, // 5 seconds
  },
  sensitive: {
    patterns: [
      /password/i,
      /token/i,
      /key/i,
      /secret/i,
      /credential/i,
      /authorization/i,
      /bearer/i,
      /session/i,
    ],
  },
};
