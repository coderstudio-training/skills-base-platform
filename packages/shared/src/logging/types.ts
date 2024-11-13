export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface LogContext {
  service: string;
  timestamp: string;
  correlationId?: string;
  userId?: string;
  traceId?: string;
  [key: string]: any;
}

export interface LoggerOptions {
  level?: LogLevel;
  format?: 'json' | 'text';
  outputs?: ('console' | 'file')[];
  filename?: string;
  maxSize?: number;
  maxFiles?: number;
  sensitiveKeys?: string[];
  file?: LogFileConfig;
}

export interface LoggerConfig {
  level: LogLevel;
  format: 'json' | 'text';
  outputs: ('console' | 'file')[];
  filename?: string;
  maxSize?: number;
  maxFiles?: number;
  file?: LogFileConfig;
}

export interface ErrorTrackerConfig {
  sampleRate: number;
  environment: string;
  release?: string;
  contextLines?: number;
  maxStackFrames?: number;
}

export interface LokiLogBase {
  ts: string; // Timestamp
  level: LogLevel; // Log level
  msg: string; // Log message
  labels: {
    // Loki labels for efficient querying
    service: string;
    env: string;
    level: string;
    host: string;
    version?: string;
  };
  // Additional fields
  traceId?: string;
  correlationId?: string;
  userId?: string;
  duration?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  http?: {
    method: string;
    path: string;
    status?: number;
    duration?: number;
  };
  // Additional context
  metadata?: Record<string, unknown>;
}

export interface WinstonLoggerConfig {
  level: LogLevel;
  format: 'json' | 'text';
  outputs: ('console' | 'file')[];
  filename?: string;
  maxSize?: number;
  maxFiles?: number;
  sensitiveKeys?: string[];
  file?: {
    path: string;
    namePattern: string;
    rotatePattern: string;
    permissions?: number;
    compress?: boolean;
  };
}

export interface ErrorTracking {
  context: {
    environment: string;
  };
  error?: {
    name: string;
    message: string;
  };
}

export interface LogRetentionConfig {
  enabled: boolean;
  days: number;
  checkInterval: number; // milliseconds
}

export interface LogFileConfig {
  path: string;
  namePattern: string;
  rotatePattern: string;
  permissions?: number;
  compress?: boolean;
  retention?: LogRetentionConfig;
}
