import { Permission, Roles } from '@/lib/api/types';

export interface LogMetadata {
  type: string;
  correlationId: string;
  timestamp: string;
  environment: string;
  userId?: string;
  role?: Roles;
  permissions?: Permission[];
  error?: {
    name?: string;
    code?: string;
    status?: number;
    message?: string;
    stack?: string;
  };
  performance?: {
    duration?: number;
    memory?: number;
  };
  request?: {
    method?: string;
    path?: string;
    origin?: string;
  };
}

export type LogLevel = 'error' | 'warn' | 'info';
