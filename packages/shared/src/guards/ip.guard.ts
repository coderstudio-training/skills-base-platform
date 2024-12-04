import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
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

    const request = context.switchToHttp().getRequest<Request>();
    const clientIp = this.getClientIp(request);
    const { path, method } = request;

    // Check if IP is in allowed list
    const isAllowed = this.isIpAllowed(clientIp);

    if (!isAllowed) {
      await this.securityMonitoring.trackThreatEvent(
        SecurityEventType.UNAUTHORIZED_IP,
        {
          ipAddress: clientIp,
          path,
          method,
          metadata: {
            allowedIps: this.config.ipWhitelist.allowedIps,
            requestHeaders: this.sanitizeHeaders(request.headers),
            timestamp: new Date().toISOString(),
          },
        },
      );

      throw new ForbiddenException('IP address not allowed');
    }

    return true;
  }

  private getClientIp(request: Request): string {
    // Check X-Forwarded-For header first (for proxied requests)
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      // Get the first IP in the chain if it's a comma-separated list
      const ips = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor.split(',')[0].trim();
      return ips;
    }

    // Check X-Real-IP header (common in Nginx)
    const realIp = request.headers['x-real-ip'];
    if (realIp) {
      return Array.isArray(realIp) ? realIp[0] : realIp;
    }

    // Fallback to request.ip (which might be using req.socket.remoteAddress)
    return request.ip || 'unknown';
  }

  private isIpAllowed(ip: string): boolean {
    // Check exact IP matches
    if (this.config.ipWhitelist.allowedIps.includes(ip)) {
      return true;
    }

    // Check CIDR ranges if configured
    if (this.config.ipWhitelist.allowedRanges) {
      return this.config.ipWhitelist.allowedRanges.some((range) =>
        this.isIpInRange(ip, range),
      );
    }

    return false;
  }

  private isIpInRange(ip: string, cidr: string): boolean {
    try {
      const [range, bits = '32'] = cidr.split('/');
      const mask = ~((1 << (32 - parseInt(bits))) - 1);

      const ipInt = this.ipToInt(ip);
      const rangeInt = this.ipToInt(range);

      return (ipInt & mask) === (rangeInt & mask);
    } catch {
      return false;
    }
  }

  private ipToInt(ip: string): number {
    return (
      ip.split('.').reduce((int, oct) => (int << 8) + parseInt(oct, 10), 0) >>>
      0
    );
  }

  private sanitizeHeaders(headers: Record<string, any>): Record<string, any> {
    const sanitized = { ...headers };
    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'x-api-key',
      'x-auth-token',
      'x-session-id',
    ];

    sensitiveHeaders.forEach((header) => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}
