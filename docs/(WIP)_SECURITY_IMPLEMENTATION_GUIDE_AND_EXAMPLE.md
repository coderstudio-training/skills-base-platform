# Security Implementation Guide & Example

## Configuration Options

The module accepts a configuration object with the following structure:

```typescript
interface SecurityConfig {
  rateLimit?: {
    enabled?: boolean;
    windowMs?: number;
    max?: number;
    skipPaths?: string[];
  };
  apiKey?: {
    enabled?: boolean;
    keys?: string[];
    excludePaths?: string[];
  };
  ipWhitelist?: {
    enabled?: boolean;
    allowedIps?: string[];
    allowedRanges?: string[];
    maxFailedAttempts?: number;
    blockDuration?: number;
  };
  payload?: {
    maxSize?: number;
    allowedContentTypes?: string[];
  };
}
```

## Implmentation Patterns

### Minimal Implementation

For basic security features with default settings:

```typescript
// app.module.ts
import { SecurityModule } from '@skills-base/shared';

@Module({
  imports: [SecurityModule.forRoot({})],
})
export class AppModule {}

// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const securityMiddleware = app.get(SecurityMiddleware);
  app.use(securityMiddleware);
  await app.listen(3000);
}
```

### Full Implementation

For comprehensive security implementation:

```typescript
// security.config.ts
import { SecurityConfig } from '@skills-base/shared';

export const securityConfig: SecurityConfig = {
  rateLimit: {
    enabled: true,
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    skipPaths: ['/health', '/metrics'],
  },
  apiKey: {
    enabled: true,
    keys: [process.env.API_KEY],
    excludePaths: ['/public', '/health'],
  },
  ipWhitelist: {
    enabled: true,
    allowedIps: process.env.ALLOWED_IPS?.split(',') || [],
    maxFailedAttempts: 5,
    blockDuration: 30 * 60 * 1000, // 30 minutes
  },
  payload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedContentTypes: [
      'application/json',
      'application/x-www-form-urlencoded',
      'multipart/form-data',
    ],
  },
};

// app.module.ts
import { SecurityModule } from '@skills-base/shared';
import { securityConfig } from './security.config';

@Module({
  imports: [SecurityModule.forRoot(securityConfig)],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityMiddleware, RequestValidationMiddleware).forRoutes('*');
  }
}

// users.controller.ts
import { Controller, Get, Post } from '@nestjs/common';
import { RateLimit, RequireApiKey } from '@skills-base/shared';

@Controller('users')
@RequireApiKey()
export class UsersController {
  @Get()
  @RateLimit({ max: 50, windowMs: 60000 }) // 50 requests per minute
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @RateLimit({ max: 10, windowMs: 60000 }) // 10 requests per minute
  create() {
    return this.usersService.create();
  }
}
```

## Feature Details

### Rate Limiting

Apply rate limiting using the `@RateLimit()` decorator:

```typescript
@RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
```

### API Key Authentication

Protect routes using the `@RequireApiKey()` decorator:

```typescript
@RequireApiKey()
@Controller('api')
export class ApiController {}
```

### IP Whitelisting

Enable IP whitelisting through configuration:

```typescript
SecurityModule.forRoot({
  ipWhitelist: {
    enabled: true,
    allowedIps: ['192.168.1.1', '10.0.0.1'],
  },
});
```

### Request Validation

The RequestValidationMiddleware automatically:

- Validates payload size
- Checks content types
- Sanitizes input
- Blocks common attack patterns

## Best Practices

1. **Environment-based Configuration**

```typescript
const environment = process.env.NODE_ENV;
const securityConfig = {
  rateLimit: {
    enabled: environment === 'production',
    max: environment === 'production' ? 100 : 1000,
  },
};
```

2. **Monitoring Security Events**

```typescript
import { SecurityMonitoringService, SecurityEventType } from '@skills-base/shared';

@Injectable()
export class CustomService {
  constructor(private securityMonitoring: SecurityMonitoringService) {}

  async handleSuspiciousActivity(req: Request) {
    await this.securityMonitoring.trackThreatEvent(SecurityEventType.SUSPICIOUS_REQUEST_PATTERN, {
      ipAddress: req.ip,
      path: req.path,
      method: req.method,
      metadata: {
        reason: 'Suspicious pattern detected',
      },
    });
  }
}
```

3. **Custom Rate Limit Configuration**

```typescript
@Controller('api')
export class ApiController {
  @Get('high-frequency')
  @RateLimit({
    windowMs: 1000, // 1 second
    max: 5,
    message: 'Too many requests for high-frequency endpoint',
  })
  highFrequencyEndpoint() {}

  @Get('low-frequency')
  @RateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
  })
  lowFrequencyEndpoint() {}
}
```

Remember to always:

- Store API keys securely using environment variables
- Configure different security settings for different environments
- Monitor and log security events
- Keep the security module updated to the latest version
