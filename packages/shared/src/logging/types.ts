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
