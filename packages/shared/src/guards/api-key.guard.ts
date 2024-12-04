import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { SecurityConfig } from '../interfaces/security.interfaces';
import {
  SecurityEventType,
  SecurityMonitoringService,
} from '../services/security-monitoring.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly securityMonitoring: SecurityMonitoringService,
    @Inject('SECURITY_CONFIG') private readonly config: SecurityConfig,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip if API key validation is disabled globally
    if (!this.config.apiKey.enabled) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const { headers, ip, path, method } = request;

    // Check if the path should be excluded
    if (this.shouldSkipPath(path)) {
      return true;
    }

    const apiKey = headers['x-api-key'];

    // If no API key is provided or the key is invalid
    if (
      !apiKey ||
      typeof apiKey !== 'string' ||
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

      throw new UnauthorizedException('Invalid or missing API key');
    }

    return true;
  }

  private shouldSkipPath(path: string): boolean {
    return (
      this.config.apiKey.excludePaths?.some((excludePath) =>
        path.startsWith(excludePath),
      ) ?? false
    );
  }
}
