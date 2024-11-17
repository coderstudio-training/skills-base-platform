import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { Request } from 'express';
import { RateLimitException } from '../exceptions/rate-limit.exception';
import { RateLimitConfig, SecurityConfig } from '../types';

@Injectable()
export class RateLimiter {
  private readonly defaultConfig: RateLimitConfig;

  constructor(
    @Inject('SECURITY_CONFIG') private readonly securityConfig: SecurityConfig,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.defaultConfig = {
      enabled: this.securityConfig.rateLimit.enabled,
      windowMs: this.securityConfig.rateLimit.windowMs,
      max: this.securityConfig.rateLimit.max,
      message: 'Too many requests, please try again later.',
      statusCode: 429,
    };
  }

  getConfig(): RateLimitConfig {
    return this.defaultConfig;
  }

  private getKey(req: Request, config: RateLimitConfig): string {
    if (config.keyGenerator) {
      return config.keyGenerator(req);
    }
    return `rate-limit:${req.ip}`;
  }

  private async incrementCounter(
    key: string,
    windowMs: number,
  ): Promise<number> {
    let current = 0;
    try {
      const stored = await this.cacheManager.get<number>(key);
      current = stored || 0;
    } catch (err) {
      // Handle cache errors gracefully
      console.error('Cache error:', err);
    }

    const ttl = windowMs / 1000; // Convert to seconds
    await this.cacheManager.set(key, current + 1, ttl);
    return current + 1;
  }

  async handleRequest(
    req: Request,
    config: Partial<RateLimitConfig> = {},
  ): Promise<boolean> {
    if (!this.securityConfig.rateLimit.enabled) {
      return true;
    }

    const mergedConfig = { ...this.defaultConfig, ...config };

    if (mergedConfig.skip && mergedConfig.skip(req)) {
      return true;
    }

    // Check if path should be skipped
    const path = req.path;
    if (this.securityConfig.rateLimit.skipPaths?.includes(path)) {
      return true;
    }

    const key = this.getKey(req, mergedConfig);
    const current = await this.incrementCounter(key, mergedConfig.windowMs);

    if (current > mergedConfig.max) {
      throw new RateLimitException(mergedConfig.message);
    }

    return true;
  }
}
