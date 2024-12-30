import { Permission, Roles } from '@/lib/api/types';

export interface ErrorMetadata {
  name?: string;
  code?: string;
  status?: number;
  message?: string;
  stack?: string;
}

export interface PerformanceMetadata {
  duration?: number;
  memory?: number;
}

export interface RequestMetadata {
  method?: string;
  path?: string;
  origin?: string;
}

export interface LogMetadata {
  type: string;
  correlationId: string;
  timestamp: string;
  environment: string;
  userId?: string;
  role?: Roles;
  permissions?: Permission[];
  error?: ErrorMetadata;
  performance?: PerformanceMetadata;
  request?: RequestMetadata;
  additionalData?: Record<string, unknown>;
}

export type LogLevel = 'error' | 'warn' | 'info';
export type SensitivePattern = RegExp;
