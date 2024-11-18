import { Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { RateLimitException } from '../exceptions/rate-limit.exception';
import {
  SecurityEventType,
  SecurityMonitoringService,
} from '../security-monitoring.service';
import { SecurityConfig } from '../security.types';

@Injectable()
export class RateLimitGuard {
  constructor(
    private readonly securityMonitoring: SecurityMonitoringService,
    @Inject('SECURITY_CONFIG') private readonly config: SecurityConfig,
  ) {}

  async handleRequest(req: Request): Promise<boolean> {
    const { ip, method, path } = req;

    if (!this.config.rateLimit.enabled) {
      return true;
    }

    // Your existing rate limit logic here
    const isLimitExceeded = false; // Replace with your actual check

    if (isLimitExceeded) {
      await this.securityMonitoring.trackThreatEvent(
        SecurityEventType.RATE_LIMIT_EXCEEDED,
        {
          ipAddress: ip ?? 'UNKNOWN IP',
          path,
          method,
          metadata: {
            limit: this.config.rateLimit.max,
            windowMs: this.config.rateLimit.windowMs,
          },
        },
      );
      throw new RateLimitException();
    }

    return true;
  }
}
