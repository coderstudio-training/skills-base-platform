import { Request as ExpressRequest } from 'express';

export interface RateLimitStore {
  increment(key: string): Promise<number>;
  decrement(key: string): Promise<number>;
  resetKey(key: string): Promise<void>;
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  statusCode?: number;
  keyGenerator?: (req: ExpressRequest) => string;
  skip?: (req: ExpressRequest) => boolean;
  store?: RateLimitStore;
}

export interface SecurityConfig {
  rateLimit: {
    enabled: boolean;
    windowMs: number;
    max: number;
    skipPaths?: string[];
  };
  apiKey: {
    enabled: boolean;
    keys: string[];
    excludePaths?: string[];
  };
  ipWhitelist: {
    enabled: boolean;
    allowedIps: string[];
  };
  payloadLimit: {
    maxSize: number;
  };
}
