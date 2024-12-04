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

export interface RateLimitConfig {
  enabled: boolean;
  windowMs: number;
  max: number;
  skipPaths?: string[];
}

export interface ApiKeyConfig {
  enabled: boolean;
  keys: string[];
  excludePaths?: string[];
}

export interface IpWhitelistConfig {
  enabled: boolean;
  allowedIps: string[];
  allowedRanges?: string[];
  maxFailedAttempts?: number;
  blockDuration?: number;
}

export interface PayloadConfig {
  maxSize: number;
  allowedContentTypes: string[];
}

export interface BruteForceConfig {
  enabled: boolean;
  maxAttempts: number;
  blockDuration: number;
  windowMs: number;
  excludePaths?: string[];
}

export interface SecurityConfig {
  rateLimit: RateLimitConfig;
  apiKey: ApiKeyConfig;
  ipWhitelist: IpWhitelistConfig;
  payload: PayloadConfig;
  bruteForce: BruteForceConfig;
}

export type PartialRateLimitConfig = Partial<RateLimitConfig>;
export type PartialApiKeyConfig = Partial<ApiKeyConfig>;
export type PartialIpWhitelistConfig = Partial<IpWhitelistConfig>;
export type PartialPayloadConfig = Partial<PayloadConfig>;
export type PartialBruteForceConfig = Partial<BruteForceConfig>;

export interface PartialSecurityConfig {
  rateLimit?: PartialRateLimitConfig;
  apiKey?: PartialApiKeyConfig;
  ipWhitelist?: PartialIpWhitelistConfig;
  payload?: PartialPayloadConfig;
  bruteForce?: PartialBruteForceConfig;
}

export interface ValidationConfig {
  payload: {
    maxSize: number;
    allowedContentTypes: string[];
  };
  headers: {
    required: string[];
    forbidden: string[];
  };
  patterns: {
    sql: RegExp[];
    xss: RegExp[];
    paths: RegExp[];
    commands: RegExp[];
  };
  sanitization: {
    enabled: boolean;
    allowedTags: string[];
    allowedAttributes: Record<string, string[]>;
  };
}

export interface RouteRateLimitConfig extends Partial<RateLimitConfig> {
  keyPrefix?: string;
  keyGenerator?: (request: ExpressRequest) => string;
  skipIf?: (request: ExpressRequest) => boolean;
  weight?: number | ((request: ExpressRequest) => number);
}
