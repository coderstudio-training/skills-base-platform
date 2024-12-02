# Security Features Implementation Guide

This guide explains how to implement comprehensive security features in your NestJS microservice using the shared security module.

## Prerequisites

1. Your service must have `@skills-base/shared` as a dependency in package.json:

```json
{
  "dependencies": {
    "@skills-base/shared": "^1.0.0"
  }
}
```

2. Required Environment Variables:

```env
API_KEYS=your,comma,separated,keys
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
IP_WHITELIST_ENABLED=true
ALLOWED_IPS=192.168.1.1,10.0.0.1
MAX_PAYLOAD_SIZE=10485760
```

## Step 1: Import Required Components

In your application, import the necessary security features:

```typescript
import { SecurityModule } from '@skills-base/shared';
import { RequireApiKey, RateLimit } from '@skills-base/shared/decorators';
```

## Step 2: Configure Security Module

### Basic Configuration

In your `app.module.ts`:

```typescript
@Module({
  imports: [
    SecurityModule.forRoot({
      rateLimit: {
        enabled: true,
        windowMs: 15 * 60 * 1000,
        max: 100,
      },
      apiKey: {
        enabled: true,
        keys: process.env.API_KEYS?.split(',') || [],
      },
      ipWhitelist: {
        enabled: true,
        allowedIps: process.env.ALLOWED_IPS?.split(',') || [],
      },
      payload: {
        maxSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
})
export class AppModule {}
```

## Step 3: Implement Security Features

### 1. Rate Limiting

Apply rate limiting to specific endpoints:

```typescript
@Controller('api')
export class ApiController {
  // Basic rate limiting
  @RateLimit()
  @Get('basic')
  basicEndpoint() {}

  // Custom rate limiting
  @RateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 requests per minute
  })
  @Post('sensitive')
  sensitiveEndpoint() {}
}
```

### 2. API Key Protection

Protect endpoints with API key requirement:

```typescript
@Controller('api')
export class ApiController {
  @RequireApiKey()
  @Get('protected')
  protectedEndpoint() {}

  // Combine with rate limiting
  @RequireApiKey()
  @RateLimit({ max: 10, windowMs: 60 * 1000 })
  @Post('very-protected')
  veryProtectedEndpoint() {}
}
```

### 3. IP Whitelist Protection

IP whitelist is configured globally and automatically applied when enabled.

### 4. Security Monitoring

Monitor security events in your services:

```typescript
@Injectable()
export class YourService {
  constructor(private readonly securityMonitoring: SecurityMonitoringService) {}

  async handleSensitiveOperation(data: any, context: any) {
    try {
      // Your sensitive operation
    } catch (error) {
      await this.securityMonitoring.trackThreatEvent(SecurityEventType.SUSPICIOUS_REQUEST_PATTERN, {
        ipAddress: context.ip,
        path: context.path,
        method: context.method,
        metadata: {
          errorType: error.name,
          errorMessage: error.message,
        },
      });
      throw error;
    }
  }
}
```

## Security Event Types

Available security event types for monitoring:

```typescript
enum SecurityEventType {
  RATE_LIMIT_EXCEEDED = 'threat.ratelimit.exceeded',
  INVALID_API_KEY = 'threat.apikey.invalid',
  UNAUTHORIZED_IP = 'threat.ip.unauthorized',
  PAYLOAD_TOO_LARGE = 'threat.payload.too_large',
  MALICIOUS_PAYLOAD = 'threat.payload.malicious',
  INVALID_REQUEST = 'threat.request.invalid',
  SUSPICIOUS_REQUEST_PATTERN = 'threat.request.suspicious',
}
```

## Error Handling

The security module handles common security-related errors:

- Invalid API Key → 403 Forbidden
- Rate Limit Exceeded → 429 Too Many Requests
- Unauthorized IP → 403 Forbidden
- Payload Too Large → 413 Payload Too Large

## Monitoring and Metrics

Security events are automatically tracked and can be monitored:

1. Via Prometheus metrics:

   - `security_rate_limit_breaches_total`
   - `security_unauthorized_access_total`
   - `security_suspicious_requests_total`
   - `security_blocked_ips_current`

2. Via logging:
   ```typescript
   // Logs are automatically generated for security events
   {
     "level": "warn",
     "message": "Security threat detected: rate limit exceeded",
     "type": "security_threat",
     "eventType": "threat.ratelimit.exceeded",
     "ipAddress": "192.168.1.1",
     "path": "/api/endpoint",
     "timestamp": "2024-11-24T12:00:00.000Z"
   }
   ```

## Best Practices

1. Rate Limiting:

   - Use stricter limits for sensitive operations
   - Adjust windows based on endpoint criticality
   - Consider different limits for authenticated vs unauthenticated users

2. API Keys:

   - Rotate keys regularly
   - Use different keys for different clients
   - Store keys securely
   - Never expose keys in logs or error messages

3. IP Whitelist:

   - Keep whitelist up to date
   - Use CIDR notation for IP ranges
   - Document all whitelisted IPs
   - Regular audit of whitelist entries

4. Payload Protection:

   - Set appropriate size limits
   - Validate content types
   - Implement content validation
   - Sanitize inputs

5. Security Monitoring:
   - Monitor security events regularly
   - Set up alerts for suspicious patterns
   - Regular review of security logs
   - Track and analyze trends

## Common Issues

1. Rate limit too restrictive:

   - Check windowMs and max values
   - Consider client requirements
   - Implement exponential backoff

2. API key not working:

   - Verify key in environment variables
   - Check header name (should be 'x-api-key')
   - Ensure key is in allowed list

3. IP whitelist issues:

   - Check IP format
   - Verify proxy configurations
   - Review load balancer settings

4. Payload size errors:
   - Check maxSize configuration
   - Verify content-length header
   - Consider compression

## Testing

When testing secured endpoints:

1. Rate Limit Testing:

```typescript
describe('Rate Limit', () => {
  it('should block excessive requests', async () => {
    // Make requests until limit
    // Verify 429 status
  });
});
```

2. API Key Testing:

```typescript
describe('API Key', () => {
  it('should reject invalid keys', () => {
    // Test with invalid key
    // Verify 403 status
  });
});
```

3. Security Monitoring Testing:

```typescript
describe('Security Monitoring', () => {
  it('should track security events', () => {
    // Mock security event
    // Verify event tracking
  });
});
```

## Configuration Reference

Full security configuration options:

```typescript
interface SecurityConfig {
  rateLimit: {
    enabled: boolean;
    windowMs: number;
    max: number;
    skipPaths?: string[];
  };
  apiKey: {
    enabled: boolean;
    keys: string[];
    excludePaths?: string[];
  };
  ipWhitelist: {
    enabled: boolean;
    allowedIps: string[];
    maxFailedAttempts?: number;
    blockDuration?: number;
  };
  payload: {
    maxSize: number;
    allowedContentTypes: string[];
  };
}
```
