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
}

export interface MonitorOptions {
  enabled?: boolean;
  sampleRate?: number;
  metricsInterval?: number;
  tags?: Record<string, string>;
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

export interface MonitorConfig {
  enabled: boolean;
  sampleRate: number;
  metricsInterval: number;
  tags: Record<string, string>;
}

export interface ErrorTrackerConfig {
  sampleRate: number;
  environment: string;
  release?: string;
  contextLines?: number;
  maxStackFrames?: number;
}

export interface LogFileConfig {
  path: string;
  namePattern: string;
  rotatePattern: string;
  permissions?: number;
  compress?: boolean;
}

export interface ELKLogBase {
  '@timestamp': string;
  'log.level': LogLevel;
  message: string;
  'service.name': string;
  'service.type': string;
  'event.dataset': string;
  'event.module': string;
  'event.kind': string;
  'event.duration'?: number;
  labels: {
    environment: string;
    version: string;
  };
  trace: {
    id: string | null;
    correlation_id: string | null;
  };
  host: {
    hostname: string;
    architecture: string;
    os: {
      platform: string;
      version: string;
    };
  };
  process: {
    pid: number;
    memory_usage: number;
    uptime: number;
  };
  http?: {
    request: {
      method: string;
      url: string;
    };
    response: {
      status_code?: number;
    };
  };
  user?: {
    id: string;
  };
  error?: {
    type: string;
    message: string;
    stack_trace?: string;
    code: string;
  };
  custom_fields?: Record<string, unknown>;
}
