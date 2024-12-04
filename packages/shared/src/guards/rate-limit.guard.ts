import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Cache } from 'cache-manager';
import { Request } from 'express';
import { RATE_LIMIT_KEY } from '../decorators/rate-limit.decorator';
import { RateLimitException } from '../exceptions/rate-limit.exception';
import { SecurityConfig } from '../interfaces/security.interfaces';
import { Logger } from '../services/logger.service';
import {
  SecurityEventType,
  SecurityMonitoringService,
} from '../services/security-monitoring.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  constructor(
    private readonly reflector: Reflector,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject('SECURITY_CONFIG') private readonly config: SecurityConfig,
    private readonly securityMonitoring: SecurityMonitoringService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.config.rateLimit.enabled) return true;

    const request = context.switchToHttp().getRequest<Request>();

    const contextArgs = context.getArgs();
    const executionMetadata = contextArgs[3] || {};
    if (executionMetadata.isSecondExecution) {
      return true;
    }
    contextArgs[3] = { isSecondExecution: true };

    if (this.shouldSkipRequest(request)) return true;

    const key = this.generateKey(request);
    const routeConfig = this.reflector.get(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    const limit = routeConfig?.max ?? this.config.rateLimit.max;
    const windowMs = routeConfig?.windowMs ?? this.config.rateLimit.windowMs;

    const currentTimestamp = Date.now();
    const windowKey = `${key}:window`;
    const countKey = `${key}:count`;

    try {
      const windowStart = await this.cacheManager.get<number>(windowKey);
      const currentCount = (await this.cacheManager.get<number>(countKey)) || 0;

      this.logger.debug('Processing rate limit', {
        ip: request.ip,
        path: request.path,
        method: request.method,
        currentCount,
        limit,
        windowStart,
        currentTimestamp,
      });

      // If window doesn't exist or has expired, start a new window
      if (!windowStart || currentTimestamp - windowStart >= windowMs) {
        await this.cacheManager.set(windowKey, currentTimestamp, windowMs);
        await this.cacheManager.set(countKey, 1, windowMs);

        this.logger.debug('Started new rate limit window', {
          ip: request.ip,
          path: request.path,
          method: request.method,
          windowMs,
        });

        return true;
      }

      // If within window and under limit, increment counter
      if (currentCount < limit) {
        await this.cacheManager.set(countKey, currentCount + 1, windowMs);

        this.logger.debug('Incremented request counter', {
          ip: request.ip,
          path: request.path,
          method: request.method,
          newCount: currentCount + 1,
          limit,
        });

        return true;
      }

      // Log rate limit violation
      this.logger.warn('Rate limit exceeded', {
        ip: request.ip,
        path: request.path,
        method: request.method,
        currentCount,
        limit,
        windowMs,
        timeRemaining: windowMs - (currentTimestamp - windowStart),
      });

      // Track security event
      await this.securityMonitoring.trackThreatEvent(
        SecurityEventType.RATE_LIMIT_EXCEEDED,
        {
          ipAddress: request.ip ?? 'unknown',
          path: request.path,
          method: request.method,
          metadata: {
            currentCount,
            limit,
            windowMs,
            timeRemaining: windowMs - (currentTimestamp - windowStart),
          },
        },
      );

      throw new RateLimitException();
    } catch (error) {
      if (error instanceof RateLimitException) throw error;

      // On cache errors, allow request but log the issue
      this.logger.error('Rate limit cache error', {
        error,
        ip: request.ip,
        path: request.path,
        method: request.method,
        key,
      });

      return true;
    }
  }

  private shouldSkipRequest(request: Request): boolean {
    const should =
      this.config.rateLimit.skipPaths?.some((path) =>
        request.path.startsWith(path),
      ) ?? false;

    if (should) {
      this.logger.debug('Skipping rate limit for path', {
        path: request.path,
        ip: request.ip,
        method: request.method,
      });
    }

    return should;
  }

  private generateKey(request: Request): string {
    const key = `rate-limit:${request.ip}:${request.method}:${request.path}`;

    this.logger.debug('Generated rate limit key', {
      key,
      ip: request.ip,
      path: request.path,
      method: request.method,
    });

    return key;
  }
}
