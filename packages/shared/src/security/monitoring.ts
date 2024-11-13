import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Logger } from '../logging/logging.service';

@Injectable()
export class SecurityMonitor {
  constructor(private readonly logger: Logger) {}

  logSecurityEvent(type: string, details: any) {
    this.logger.error('Security event detected', {
      type,
      details,
    });
  }

  logRateLimitExceeded(req: Request) {
    this.logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      headers: req.headers,
    });
  }

  logInvalidApiKey(req: Request) {
    this.logger.warn('Invalid API key', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      apiKey: req.headers['x-api-key'],
    });
  }

  logBlockedIp(req: Request) {
    this.logger.warn('Blocked IP address', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
  }

  logSecurityViolation(type: string, details: any) {
    this.logger.error('Security violation detected', {
      type,
      details,
    });
  }
}
