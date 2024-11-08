import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Optional } from '@nestjs/common';
import { Request } from 'express';
import { RateLimitException } from '../exceptions/rate-limit.exception';
import { RateLimitConfig } from '../types';

@Injectable()
export class RateLimiter {
  private readonly defaultConfig: RateLimitConfig;

  constructor(
    @Inject('SECURITY_CONFIG') private readonly securityConfig: any,
    @Optional() @Inject(CACHE_MANAGER) private cacheManager: Record<any, any>,
  ) {
    this.defaultConfig = {
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
    const current = (await this.cacheManager.get(key)) || 0;
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
