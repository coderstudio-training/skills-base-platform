# Security Package

A comprehensive security package for NestJS applications providing rate limiting, API key authentication, IP whitelisting, and other security features.

## Features

- 🚦 Rate Limiting
- 🔑 API Key Authentication
- 🛡️ IP Whitelisting
- 📝 Request Validation
- 🔒 Security Headers
- 📊 Security Monitoring

## Quick Start

```typescript
// app.module.ts
import { SecurityModule } from '@skills-base/shared';

@Module({
  imports: [
    SecurityModule.forRoot({
      rateLimit: {
        enabled: true,
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // 100 requests per window
        skipPaths: ['/health'],
      },
      apiKey: {
        enabled: true,
        keys: ['your-api-key'],
        excludePaths: ['/public'],
      },
      ipWhitelist: {
        enabled: false,
        allowedIps: [],
      },
      payloadLimit: {
        maxSize: 1024 * 1024, // 1MB
      },
    }),
  ],
})
export class AppModule {}
```

## Usage Examples

### Rate Limiting

```typescript
import { RateLimit } from '@skills-base/shared';

@Controller('users')
export class UserController {
  // Default rate limit
  @RateLimit()
  @Get()
  findAll() {}

  // Custom rate limit
  @RateLimit({
    windowMs: 60000, // 1 minute
    max: 5, // 5 requests per minute
  })
  @Post()
  create() {}
}
```

### API Key Authentication

```typescript
import { RequireApiKey } from '@skills-base/shared';

@Controller('api')
@RequireApiKey()
export class ApiController {
  @Get()
  secureEndpoint() {}
}
```

### Request Validation

```typescript
import { RequestValidator } from '@skills-base/shared';

@Controller('uploads')
export class UploadController {
  @Post()
  @UseGuards(RequestValidator.validatePayloadSize(5 * 1024 * 1024)) // 5MB limit
  uploadFile() {}
}
```

## Configuration

### Security Config Interface

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
  };
  payloadLimit: {
    maxSize: number;
  };
}
```

### Custom Rate Limit Configuration

```typescript
@RateLimit({
  windowMs: 60000,
  max: 5,
  message: 'Too many requests',
  keyGenerator: (req) => `rate-limit:${req.ip}:${req.user?.id}`,
  skip: (req) => req.headers['x-internal-call'] === 'true'
})
```

## Security Headers

The package automatically sets the following security headers:

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000; includeSubDomains
- Content-Security-Policy: default-src 'self'

## Security Monitoring

```typescript
import { SecurityMonitor } from '@your-org/security';

@Injectable()
export class YourService {
  constructor(private securityMonitor: SecurityMonitor) {}

  someMethod() {
    this.securityMonitor.logSecurityViolation('unauthorized-access', {
      userId: 'user123',
      resource: 'sensitive-data',
    });
  }
}
```
