import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';

export enum SecurityEventType {
  // Rate Limiting Events
  RATE_LIMIT_EXCEEDED = 'threat.ratelimit.exceeded',

  // Access Control Events
  INVALID_API_KEY = 'threat.apikey.invalid',
  UNAUTHORIZED_IP = 'threat.ip.unauthorized',

  // Payload Events
  PAYLOAD_TOO_LARGE = 'threat.payload.too_large',
  MALICIOUS_PAYLOAD = 'threat.payload.malicious',

  // Request Events
  INVALID_REQUEST = 'threat.request.invalid',
  SUSPICIOUS_REQUEST_PATTERN = 'threat.request.suspicious',
}

export interface SecurityEventContext {
  ipAddress: string;
  path: string;
  method: string;
  userId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class SecurityMonitoringService {
  private readonly securityMetrics: {
    rateLimitBreaches: client.Counter;
    unauthorizedAccess: client.Counter;
    suspiciousRequests: client.Counter;
    blockedIps: client.Gauge;
  };

  constructor() {
    // Initialize security-specific metrics
    this.securityMetrics = {
      rateLimitBreaches: new client.Counter({
        name: 'security_rate_limit_breaches_total',
        help: 'Total number of rate limit breaches',
        labelNames: ['path', 'ip_address', 'method'],
      }),

      unauthorizedAccess: new client.Counter({
        name: 'security_unauthorized_access_total',
        help: 'Total number of unauthorized access attempts',
        labelNames: ['type', 'path', 'ip_address'],
      }),

      suspiciousRequests: new client.Counter({
        name: 'security_suspicious_requests_total',
        help: 'Total number of suspicious or malicious requests',
        labelNames: ['type', 'path', 'ip_address'],
      }),

      blockedIps: new client.Gauge({
        name: 'security_blocked_ips_current',
        help: 'Current number of blocked IPs',
        labelNames: ['reason'],
      }),
    };
  }

  async trackThreatEvent(
    eventType: SecurityEventType,
    context: SecurityEventContext,
  ): Promise<void> {
    try {
      // Log the threat event
      this.logThreatEvent(eventType, context);

      // Track appropriate metrics based on event type
      this.trackEventMetrics(eventType, context);
    } catch (error) {
      console.error('Failed to track security threat event', {
        error,
        eventType,
        context,
      });
    }
  }

  private logThreatEvent(
    eventType: SecurityEventType,
    context: SecurityEventContext,
  ): void {
    const message = `Security threat detected: ${eventType.replace(/\./g, ' ')} from ${context.ipAddress}`;
    console.warn(message, {
      type: 'security_threat',
      eventType,
      ...context,
      timestamp: new Date().toISOString(),
    });
  }

  private trackEventMetrics(
    eventType: SecurityEventType,
    context: SecurityEventContext,
  ): void {
    const { ipAddress, path, method } = context;

    switch (eventType) {
      case SecurityEventType.RATE_LIMIT_EXCEEDED:
        this.securityMetrics.rateLimitBreaches.inc({
          path,
          ip_address: ipAddress,
          method,
        });
        break;

      case SecurityEventType.INVALID_API_KEY:
      case SecurityEventType.UNAUTHORIZED_IP:
        this.securityMetrics.unauthorizedAccess.inc({
          type: eventType,
          path,
          ip_address: ipAddress,
        });
        this.securityMetrics.blockedIps.inc({ reason: eventType });
        break;

      case SecurityEventType.PAYLOAD_TOO_LARGE:
      case SecurityEventType.MALICIOUS_PAYLOAD:
      case SecurityEventType.INVALID_REQUEST:
      case SecurityEventType.SUSPICIOUS_REQUEST_PATTERN:
        this.securityMetrics.suspiciousRequests.inc({
          type: eventType,
          path,
          ip_address: ipAddress,
        });
        break;
    }
  }
}
