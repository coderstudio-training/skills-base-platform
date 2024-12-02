import { Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { SecurityConfig } from '../interfaces/security.interfaces';
import {
  SecurityEventType,
  SecurityMonitoringService,
} from '../services/security-monitoring.service';

@Injectable()
export class ApiKeyGuard {
  constructor(
    private readonly securityMonitoring: SecurityMonitoringService,
    @Inject('SECURITY_CONFIG') private readonly config: SecurityConfig,
  ) {}

  async handleRequest(req: Request): Promise<boolean> {
    if (!this.config.apiKey.enabled) {
      return true;
    }

    const { headers, ip, path, method } = req;
    const apiKey = headers['x-api-key'];

    if (
      typeof apiKey === 'string' &&
      !this.config.apiKey.keys.includes(apiKey)
    ) {
      await this.securityMonitoring.trackThreatEvent(
        SecurityEventType.INVALID_API_KEY,
        {
          ipAddress: ip ?? 'UNKNOWN IP',
          path,
          method,
          metadata: {
            providedKey: apiKey ? 'invalid' : 'missing',
          },
        },
      );

      return false;
    }

    return true;
  }
}
