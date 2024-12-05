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
    if (!this.config.ipWhitelist.enabled) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const clientIp = this.getClientIp(request);
    const { path, method } = request;

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
      // Always split and trim, regardless of array or string
      const firstIp = Array.isArray(forwardedFor)
        ? forwardedFor[0].split(',')[0].trim()
        : forwardedFor.split(',')[0].trim();

      if (this.isValidIp(firstIp)) {
        return firstIp;
      }
    }

    // Check X-Real-IP header
    const realIp = request.headers['x-real-ip'];
    if (realIp) {
      const ip = Array.isArray(realIp) ? realIp[0] : realIp;
      if (this.isValidIp(ip)) {
        return ip;
      }
    }

    // Fallback to request.ip
    return request.ip && this.isValidIp(request.ip) ? request.ip : 'unknown';
  }

  private isValidIp(ip: string): boolean {
    if (!ip) return false;

    const octets = ip.split('.');
    if (octets.length !== 4) return false;

    return octets.every((octet) => {
      const num = parseInt(octet, 10);
      return !isNaN(num) && num >= 0 && num <= 255;
    });
  }

  private isIpAllowed(ip: string): boolean {
    if (!this.isValidIp(ip)) {
      return false;
    }

    // Check exact IP matches
    if (this.config.ipWhitelist.allowedIps.includes(ip)) {
      return true;
    }

    // Check CIDR ranges if configured
    if (
      Array.isArray(this.config.ipWhitelist.allowedRanges) &&
      this.config.ipWhitelist.allowedRanges.length > 0
    ) {
      return this.config.ipWhitelist.allowedRanges.some((range) =>
        this.isIpInRange(ip, range),
      );
    }

    return false;
  }

  private isIpInRange(ip: string, cidr: string): boolean {
    try {
      const [range, bits = '32'] = cidr.split('/');

      if (!this.isValidIp(range)) {
        return false;
      }

      const bitNum = parseInt(bits, 10);
      if (isNaN(bitNum) || bitNum < 0 || bitNum > 32) {
        return false;
      }

      const mask = bitNum === 32 ? -1 : ~((1 << (32 - bitNum)) - 1);

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
