export interface LogMetadata {
  correlationId?: string;
  userId?: string;
  level?: 'error' | 'warn' | 'info';
  performance?: {
    duration?: number;
  };
  error?: {
    code?: string;
    status?: number;
    message?: string;
    stack?: string;
  };
  [key: string]: unknown;
}

export type LogLevel = 'error' | 'warn' | 'info';

export interface LoggerInterface {
  error(message: string | Error, metadata?: LogMetadata): void;
  warn(message: string, metadata?: LogMetadata): void;
  info(message: string, metadata?: LogMetadata): void;
}
