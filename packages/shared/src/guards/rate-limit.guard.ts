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
import { Logger } from '../services/logger.service';
import {
  SecurityEventType,
  SecurityMonitoringService,
} from '../services/security-monitoring.service';

@Injectable()
export class RateLimitGuard {
  private readonly logger = new Logger(RateLimitGuard.name);

  constructor(
    private readonly reflector: Reflector,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject('SECURITY_CONFIG') private readonly securityConfig: SecurityConfig,
    private readonly securityMonitoring: SecurityMonitoringService,
  ) {
    this.logger.info('RateLimitGuard initialized', {
      config: {
        enabled: this.securityConfig.rateLimit.enabled,
        windowMs: this.securityConfig.rateLimit.windowMs,
        max: this.securityConfig.rateLimit.max,
        skipPaths: this.securityConfig.rateLimit.skipPaths,
      },
    });
  }

  async handleRequest(req: Request): Promise<boolean> {
    this.logger.debug(`Processing request ${req.method} ${req.path}`, {
      ip: req.ip,
    });

    // Check if rate limiting is globally enabled
    if (!this.securityConfig.rateLimit.enabled) {
      this.logger.debug('Rate limiting is globally disabled');
      return true;
    }

    const routeConfig = this.reflector.get<RouteRateLimitConfig>(
      RATE_LIMIT_KEY,
      req.constructor,
    );

    this.logger.debug('Route config retrieved', { routeConfig });

    // Check global skip paths
    if (this.shouldSkipPath(req.path)) {
      this.logger.debug(`Skipping rate limit for path: ${req.path}`);
      return true;
    }

    // Merge global and route-specific configs
    const config = this.mergeConfigs(routeConfig);

    this.logger.debug('Merged rate limit config', { config });

    return this.handleRateLimit(req, config);
  }

  private shouldSkipPath(path: string): boolean {
    const shouldSkip =
      this.securityConfig.rateLimit.skipPaths?.some((skipPath) =>
        path.startsWith(skipPath),
      ) ?? false;

    this.logger.debug(`Path skip check result: ${shouldSkip}`, { path });
    return shouldSkip;
  }

  private mergeConfigs(
    routeConfig?: RouteRateLimitConfig,
  ): Required<RouteRateLimitConfig> {
    return {
      enabled: this.securityConfig.rateLimit.enabled,
      windowMs: routeConfig?.windowMs ?? this.securityConfig.rateLimit.windowMs,
      max: routeConfig?.max ?? this.securityConfig.rateLimit.max,
      keyPrefix: routeConfig?.keyPrefix ?? 'rl',
      keyGenerator: routeConfig?.keyGenerator ?? this.generateKey.bind(this),
      skipIf: routeConfig?.skipIf ?? (() => false),
      weight: routeConfig?.weight ?? 1,
      message: routeConfig?.message ?? 'Rate limit exceeded',
      statusCode: routeConfig?.statusCode ?? 429,
      skip: routeConfig?.skip ?? (() => false),
      store: routeConfig?.store ?? ({} as RateLimitStore),
      skipPaths: routeConfig?.skipPaths ?? [],
    };
  }

  private generateKey(req: Request): string {
    const key = `${req.ip}:${req.method}:${req.path}`;
    this.logger.debug(`Generated rate limit key: ${key}`);
    return key;
  }

  private async handleRateLimit(
    req: Request,
    config: Required<RouteRateLimitConfig>,
  ): Promise<boolean> {
    if (config.skipIf?.(req)) {
      this.logger.debug('Skipping rate limit based on skipIf condition');
      return true;
    }

    const key = this.generateKey(req);
    const weight = this.calculateWeight(req, config);

    try {
      const current = await this.incrementCounter(key, config.windowMs, weight);
      this.logger.debug('Current request count', {
        key,
        current,
        limit: config.max,
      });

      if (current > config.max) {
        await this.handleExceededLimit(req, config);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('Rate limit cache error:', { error });
      return true; // Fail open on cache errors
    }
  }

  private calculateWeight(
    req: Request,
    config: Required<RouteRateLimitConfig>,
  ): number {
    const weight =
      typeof config.weight === 'function' ? config.weight(req) : config.weight;
    this.logger.debug('Calculated request weight', { weight });
    return weight;
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

      this.logger.debug('Counter incremented', {
        key,
        previous: stored,
        current,
        ttl,
      });
    } catch (error) {
      this.logger.error('Failed to increment rate limit counter', { error });
      throw error;
    }

    return current;
  }

  private async handleExceededLimit(
    req: Request,
    config: Required<RouteRateLimitConfig>,
  ): Promise<void> {
    this.logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      limit: config.max,
      windowMs: config.windowMs,
    });

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

    throw new RateLimitException(config.message);
  }
}
