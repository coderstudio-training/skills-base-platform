// guards/api-key.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const { headers, ip = 'UNKNOWN_IP', path, method } = request;

    // Check if path should be skipped
    if (this.shouldSkipPath(path)) {
      return true;
    }

    const apiKey = headers['x-api-key'];
    if (!apiKey || typeof apiKey !== 'string') {
      await this.handleUnauthorized('missing', ip, path, method);
      throw new UnauthorizedException('Missing API key');
    }

    // Find the API key in configuration
    const keyData = this.config.apiKey.keys.find((k) => k.key === apiKey);
    if (!keyData || !keyData.isActive) {
      await this.handleUnauthorized('invalid', ip, path, method);
      throw new UnauthorizedException('Invalid API key');
    }

    // Check expiration
    if (keyData.expiresAt && new Date() > new Date(keyData.expiresAt)) {
      await this.handleUnauthorized('expired', ip, path, method);
      throw new UnauthorizedException('API key has expired');
    }

    // Attach API key data to request for use in permissions guard
    // request['apiKeyData'] = keyData;
    return true;
  }

  private shouldSkipPath(path: string): boolean {
    return (
      this.config.apiKey.excludePaths?.some((excludePath) =>
        path.startsWith(excludePath),
      ) ?? false
    );
  }

  private async handleUnauthorized(
    reason: string,
    ip: string,
    path: string,
    method: string,
  ): Promise<void> {
    await this.securityMonitoring.trackThreatEvent(
      SecurityEventType.INVALID_API_KEY,
      {
        ipAddress: ip ?? 'UNKNOWN IP',
        path,
        method,
        metadata: {
          reason,
        },
      },
    );
  }
}
