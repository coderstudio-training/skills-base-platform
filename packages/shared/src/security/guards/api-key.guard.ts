import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import {
  SecurityEventType,
  SecurityMonitoringService,
} from '../security-monitoring.service';
import { SecurityConfig } from '../types';

@Injectable()
export class ApiKeyGuard {
  constructor(
    private readonly securityMonitoring: SecurityMonitoringService,
    private readonly config: SecurityConfig,
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
