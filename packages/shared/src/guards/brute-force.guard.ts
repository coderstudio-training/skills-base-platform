import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Request } from 'express';
import { RateLimitException } from '../exceptions/rate-limit.exception';
import { SecurityConfig } from '../interfaces/security.interfaces';
import { Logger } from '../services/logger.service';
import {
  SecurityEventType,
  SecurityMonitoringService,
} from '../services/security-monitoring.service';
import { HttpContextUtils } from '../utils/http.utils';

@Injectable()
export class BruteForceGuard implements CanActivate {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject('SECURITY_CONFIG') private readonly config: SecurityConfig,
    private readonly securityMonitoring: SecurityMonitoringService,
    private readonly logger: Logger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.config.bruteForce.enabled) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const requestContext = HttpContextUtils.getRequestContext(request);
    const ip = requestContext.ip || 'unknown';

    if (request.method === 'POST' && request.path.includes('login')) {
      // Store the request in metadata for use after the route handler
      context.switchToHttp().getResponse().locals.bruteForceContext = {
        ip,
        correlationId: requestContext.correlationId,
      };

      const isBlocked = await this.isIpBlocked(ip);
      if (isBlocked) {
        const remainingTime = await this.getBlockTimeRemaining(ip);

        this.logger.warn(`Blocked IP attempting access: ${ip}`, {
          type: 'security.blocked_attempt',
          correlationId: requestContext.correlationId,
          ip,
          remainingBlockTime: remainingTime,
        });

        await this.securityMonitoring.trackThreatEvent(
          SecurityEventType.SUSPICIOUS_REQUEST_PATTERN,
          {
            ipAddress: ip,
            path: requestContext.path,
            method: requestContext.method,
            metadata: {
              reason: 'Blocked IP attempting login',
              remainingBlockTime: remainingTime,
              correlationId: requestContext.correlationId,
            },
          },
        );

        throw new RateLimitException(
          'Too many failed attempts. Please try again later.',
        );
      }

      try {
        const attempts = await this.getAttempts(ip);
        if (attempts > 0) {
          this.logger.debug(`Previous failed attempts for IP: ${ip}`, {
            type: 'security.previous_attempts',
            ip,
            attempts,
          });
        }
      } catch (error) {
        this.logger.error('Error checking previous attempts', {
          type: 'security.error',
          ip,
          error: error.message,
        });
      }
    }

    return true;
  }

  private getIpKey(ip: string): string {
    return `brute_force:${ip}:attempts`;
  }

  private getBlockKey(ip: string): string {
    return `brute_force:${ip}:blocked`;
  }

  private async isIpBlocked(ip: string): Promise<boolean> {
    const key = this.getBlockKey(ip);
    return (await this.cacheManager.get<boolean>(key)) || false;
  }

  private async getBlockTimeRemaining(ip: string): Promise<number> {
    const key = this.getBlockKey(ip);
    const ttl = await this.cacheManager.store.ttl(key);
    return Math.max(0, ttl);
  }

  private async getAttempts(ip: string): Promise<number> {
    const key = this.getIpKey(ip);
    return (await this.cacheManager.get<number>(key)) || 0;
  }

  async handleLoginResult(request: Request, success: boolean): Promise<void> {
    const requestContext = HttpContextUtils.getRequestContext(request);
    const ip = requestContext.ip;

    if (success) {
      await this.resetAttempts(ip ?? 'UNKNOWN_IP');
      this.logger.info('Successful login attempt', {
        type: 'security.login_success',
        ip,
        correlationId: requestContext.correlationId,
      });
    } else {
      await this.incrementAttempts(ip ?? 'UNKNOWN_IP');
      this.logger.warn('Failed login attempt', {
        type: 'security.login_failure',
        ip,
        correlationId: requestContext.correlationId,
      });
    }
  }

  private async incrementAttempts(ip: string): Promise<void> {
    const key = this.getIpKey(ip);
    const attempts = (await this.getAttempts(ip)) + 1;

    this.logger.debug(`Incrementing failed attempts for IP: ${ip}`, {
      type: 'security.attempt_increment',
      ip,
      attempts,
    });

    await this.cacheManager.set(
      key,
      attempts,
      this.config.bruteForce.maxAttempts,
    );

    if (attempts >= this.config.bruteForce.maxAttempts) {
      const blockKey = this.getBlockKey(ip);
      await this.cacheManager.set(
        blockKey,
        true,
        this.config.bruteForce.blockDuration,
      );

      this.logger.warn(
        `IP address blocked due to too many failed attempts: ${ip}`,
        {
          type: 'security.ip_blocked',
          ip,
          attempts,
          blockDuration: this.config.bruteForce.blockDuration,
        },
      );

      await this.securityMonitoring.trackThreatEvent(
        SecurityEventType.BRUTE_FORCE_DETECTED,
        {
          path: '/auth/login',
          method: 'POST',
          ipAddress: ip,
          metadata: {
            attempts,
            blockDuration: this.config.bruteForce.blockDuration,
          },
        },
      );
    }
  }

  private async resetAttempts(ip: string): Promise<void> {
    const key = this.getIpKey(ip);
    await this.cacheManager.del(key);

    this.logger.debug(`Reset attempts for IP: ${ip}`, {
      type: 'security.attempts_reset',
      ip,
    });
  }
}
