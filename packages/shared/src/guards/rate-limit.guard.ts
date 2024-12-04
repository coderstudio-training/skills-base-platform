import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Cache } from 'cache-manager';
import { Request } from 'express';
import { RATE_LIMIT_KEY } from '../decorators/rate-limit.decorator';
import { RateLimitException } from '../exceptions/rate-limit.exception';
import {
  RateLimitStore,
  RouteRateLimitConfig,
  SecurityConfig,
} from '../interfaces/security.interfaces';
import {
  SecurityEventType,
  SecurityMonitoringService,
} from '../services/security-monitoring.service';

@Injectable()
export class RateLimitGuard {
  constructor(
    private readonly reflector: Reflector,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject('SECURITY_CONFIG') private readonly securityConfig: SecurityConfig,
    private readonly securityMonitoring: SecurityMonitoringService,
  ) {}

  async handleRequest(req: Request): Promise<boolean> {
    // Check if rate limiting is globally enabled
    if (!this.securityConfig.rateLimit.enabled) {
      return true;
    }

    const routeConfig = this.reflector.get<RouteRateLimitConfig>(
      RATE_LIMIT_KEY,
      req.constructor,
    );

    // Check global skip paths
    if (this.shouldSkipPath(req.path)) {
      return true;
    }

    // Merge global and route-specific configs
    const config = this.mergeConfigs(routeConfig);

    return this.handleRateLimit(req, config);
  }

  private shouldSkipPath(path: string): boolean {
    return (
      this.securityConfig.rateLimit.skipPaths?.some((skipPath) =>
        path.startsWith(skipPath),
      ) ?? false
    );
  }

  private mergeConfigs(
    routeConfig?: RouteRateLimitConfig,
  ): Required<RouteRateLimitConfig> {
    return {
      enabled: this.securityConfig.rateLimit.enabled,
      windowMs: routeConfig?.windowMs ?? this.securityConfig.rateLimit.windowMs,
      max: routeConfig?.max ?? this.securityConfig.rateLimit.max,
      keyPrefix: routeConfig?.keyPrefix ?? 'rl',
      keyGenerator: routeConfig?.keyGenerator ?? (() => ''),
      skipIf: routeConfig?.skipIf ?? (() => false),
      weight: routeConfig?.weight ?? 1,
      message: routeConfig?.message ?? 'Rate limit exceeded',
      statusCode: routeConfig?.statusCode ?? 429,
      skip: routeConfig?.skip ?? (() => false),
      store: routeConfig?.store ?? ({} as RateLimitStore),
      skipPaths: routeConfig?.skipPaths ?? [],
    };
  }

  private async handleRateLimit(
    req: Request,
    config: Required<RouteRateLimitConfig>,
  ): Promise<boolean> {
    if (config.skipIf?.(req)) {
      return true;
    }

    const key = this.generateKey(req, config);
    const weight = this.calculateWeight(req, config);

    try {
      const current = await this.incrementCounter(key, config.windowMs, weight);

      if (current > config.max) {
        await this.handleExceededLimit(req, config);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Rate limit cache error:', error);
      return true;
    }
  }

  private generateKey(
    req: Request,
    config: Required<RouteRateLimitConfig>,
  ): string {
    if (config.keyGenerator) {
      return config.keyGenerator(req);
    }

    const identifier = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    return `${config.keyPrefix}:${identifier}`;
  }

  private calculateWeight(
    req: Request,
    config: Required<RouteRateLimitConfig>,
  ): number {
    if (typeof config.weight === 'function') {
      return config.weight(req);
    }
    return config.weight;
  }

  private async incrementCounter(
    key: string,
    windowMs: number,
    weight: number,
  ): Promise<number> {
    const ttl = Math.ceil(windowMs / 1000);
    let current = 0;

    try {
      const stored = await this.cacheManager.get<number>(key);
      current = (stored || 0) + weight;
      await this.cacheManager.set(key, current, ttl);
    } catch (error) {
      throw new Error(
        `Failed to increment rate limit counter: ${error.message}`,
      );
    }

    return current;
  }

  private async handleExceededLimit(
    req: Request,
    config: Required<RouteRateLimitConfig>,
  ): Promise<void> {
    await this.securityMonitoring.trackThreatEvent(
      SecurityEventType.RATE_LIMIT_EXCEEDED,
      {
        ipAddress: req.ip ?? 'UNKNOWN IP',
        path: req.path,
        method: req.method,
        metadata: {
          limit: config.max,
          windowMs: config.windowMs,
          weight:
            typeof config.weight === 'function' ? 'dynamic' : config.weight,
        },
      },
    );

    throw new RateLimitException();
  }
}
