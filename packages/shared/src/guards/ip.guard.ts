import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { SecurityConfig } from '../interfaces/security.interfaces';
import {
  SecurityEventType,
  SecurityMonitoringService,
} from '../services/security-monitoring.service';

@Injectable()
export class IpWhitelistGuard implements CanActivate {
  constructor(
    @Inject('SECURITY_CONFIG') private readonly config: SecurityConfig,
    private readonly securityMonitoring: SecurityMonitoringService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip if IP whitelist is not enabled
    if (!this.config.ipWhitelist.enabled) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { ip, path, method } = request;

    // Check if IP is in allowed list
    const isAllowed = this.config.ipWhitelist.allowedIps.includes(ip);

    if (!isAllowed) {
      await this.securityMonitoring.trackThreatEvent(
        SecurityEventType.UNAUTHORIZED_IP,
        {
          ipAddress: ip,
          path,
          method,
          metadata: {
            allowedIps: this.config.ipWhitelist.allowedIps,
            requestHeaders: this.sanitizeHeaders(request.headers),
            // Include additional context that might be useful for security analysis
            timestamp: new Date().toISOString(),
            forwardedFor: request.headers['x-forwarded-for'],
            realIp: request.headers['x-real-ip'],
            host: request.headers.host,
            userAgent: request.headers['user-agent'],
          },
        },
      );

      throw new ForbiddenException('IP address not allowed');
    }

    return true;
  }

  private sanitizeHeaders(headers: Record<string, any>): Record<string, any> {
    // Create a copy of headers and remove sensitive information
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];

    sensitiveHeaders.forEach((header) => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}
