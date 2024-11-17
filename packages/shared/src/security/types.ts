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

export interface SecurityConfig {
  rateLimit: RateLimitConfig;
  apiKey: ApiKeyConfig;
  ipWhitelist: IpWhitelistConfig;
  payload: PayloadConfig;
}

export type PartialRateLimitConfig = Partial<RateLimitConfig>;
export type PartialApiKeyConfig = Partial<ApiKeyConfig>;
export type PartialIpWhitelistConfig = Partial<IpWhitelistConfig>;
export type PartialPayloadConfig = Partial<PayloadConfig>;

export interface PartialSecurityConfig {
  rateLimit?: PartialRateLimitConfig;
  apiKey?: PartialApiKeyConfig;
  ipWhitelist?: PartialIpWhitelistConfig;
  payload?: PartialPayloadConfig;
}
