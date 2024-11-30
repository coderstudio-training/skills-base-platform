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

export interface LokiLogBase {
  ts: string; // Timestamp
  level: LogLevel; // Log level
  msg: string; // Log message
  labels: {
    service: string;
    env: string;
    level: string;
    host: string;
    version?: string;
  };
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
  metadata?: Record<string, unknown>;
}

export interface WinstonLoggerConfig {
  level: LogLevel;
  format: 'json' | 'text';
  outputs: ('console' | 'file' | 'loki')[];
  filename?: string;
  maxSize?: number;
  maxFiles?: number;
  sensitiveKeys?: string[];
  file?: LogFileConfig;
}

export interface LogRetentionConfig {
  enabled: boolean;
  days: number;
  checkInterval: number;
}

export interface LogFileConfig {
  path: string;
  namePattern: string;
  rotatePattern: string;
  permissions?: number;
  compress?: boolean;
  retention?: LogRetentionConfig;
}

export interface RequestContext {
  method: string;
  path: string;
  correlationId?: string;
  userId?: string;
  userAgent?: string;
  query?: Record<string, any>;
  params?: Record<string, any>;
  body?: Record<string, any>;
  ip?: string;
  timestamp: string;
  duration?: number;
}

export interface ResponseContext extends RequestContext {
  statusCode: number;
  responseSize?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
}

export interface LoggingModuleOptions {
  serviceName?: string;
  environment?: string;
  enableRequestLogging?: boolean;
  enableGlobalInterceptor?: boolean;
  skipPaths?: string[];
}

export interface ErrorContext {
  userId?: string;
  correlationId?: string;
  component?: string;
  [key: string]: any;
}

export interface ErrorDetails {
  name: string;
  message: string;
  stack?: string;
  code?: string;
  timestamp: string;
  context?: ErrorContext;
}

export interface LoggingConfig {
  logger: WinstonLoggerConfig;
}
