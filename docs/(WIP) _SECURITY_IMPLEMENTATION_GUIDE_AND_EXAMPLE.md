# Security Implementation Guide & Example

# DISCLAIMER: THIS IS A WORK IN PROGRESS, MAY CAUSE ERRORS

### 1. Register the Security Module

```typescript
// app.module.ts
import { SecurityModule } from '@skills-base/shared';

@Module({
  imports: [
    SecurityModule.forRoot({
      rateLimit: {
        enabled: true,
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        skipPaths: ['/health', '/metrics'],
      },
      apiKey: {
        enabled: true,
        keys: ['your-api-key-1', 'your-api-key-2'],
        excludePaths: ['/public'],
      },
      ipWhitelist: {
        enabled: false,
        allowedIps: [],
      },
      payloadLimit: {
        maxSize: 5 * 1024 * 1024, // 5MB
      },
    }),
    // ... other modules
  ],
})
export class AppModule {}
```

### 2. Apply Global Security Middleware

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { SecurityMiddleware } from '@skills-base/shared';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply security middleware globally
  app.use(app.get(SecurityMiddleware).use.bind(app.get(SecurityMiddleware)));

  await app.listen(3000);
}
bootstrap();
```

## Feature Usage

### Rate Limiting

#### Method 1: Using Decorator (Recommended)

```typescript
import { RateLimit } from '@skills-base/shared';

@Controller('users')
export class UsersController {
  @RateLimit({ windowMs: 60000, max: 5 }) // 5 requests per minute
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
```

#### Method 2: Using Guard Directly

```typescript
import { RateLimitGuard } from '@skills-base/shared';

@Controller('users')
@UseGuards(RateLimitGuard)
export class UsersController {
  // ... controller methods
}
```

### API Key Authentication

```typescript
import { RequireApiKey } from '@skills-base/shared;

@Controller('admin')
export class AdminController {
  @RequireApiKey()
  @Post('settings')
  updateSettings() {
    // Only accessible with valid API key
  }
}
```

### Request Validation

```typescript
import { RequestValidator } from '@skills-base/shared;

@Controller('documents')
export class DocumentsController {
  @Post()
  create(@Body() document: any) {
    // Sanitize input
    const sanitizedDoc = RequestValidator.sanitizeInput(document);
    return this.documentsService.create(sanitizedDoc);
  }
}
```

### Security Monitoring

```typescript
import { SecurityMonitor } from '@skills-base/shared;

@Injectable()
export class AuthService {
  constructor(private securityMonitor: SecurityMonitor) {}

  async validateUser(req: Request) {
    try {
      // ... validation logic
    } catch (error) {
      this.securityMonitor.logSecurityViolation('AUTH_FAILED', {
        ip: req.ip,
        reason: error.message,
      });
      throw error;
    }
  }
}
```

## Advanced Configuration

### Custom Rate Limit Key Generator

```typescript
import { SecurityModule } from '@skills-base/shared;

@Module({
  imports: [
    SecurityModule.forRoot({
      rateLimit: {
        enabled: true,
        windowMs: 60000,
        max: 100,
        keyGenerator: (req: Request) => {
          // Custom key based on both IP and user ID
          return `${req.ip}-${req.headers['user-id']}`;
        },
      },
      // ... other config
    }),
  ],
})
export class AppModule {}
```

### Feature Module Setup

For modules that only need rate limiting:

```typescript
import { SecurityModule } from '@skills-base/shared;

@Module({
  imports: [SecurityModule.forFeature()],
  // ... other module configuration
})
export class FeatureModule {}
```

## Best Practices

1. **Rate Limiting:**

   - Set appropriate limits based on endpoint sensitivity
   - Use lower limits for authentication endpoints
   - Skip health check endpoints

2. **API Keys:**

   - Rotate keys regularly
   - Use different keys for different environments
   - Store keys securely (use environment variables)

3. **Security Headers:**

   - Keep the default security headers
   - Add additional headers based on your needs
   - Review headers regularly

4. **Monitoring:**
   - Monitor failed attempts
   - Set up alerts for security violations
   - Regular review of security logs

## Error Handling

The module provides built-in exceptions:

- `RateLimitException`: Thrown when rate limit is exceeded
- `PayloadTooLargeException`: Thrown when request payload exceeds limit

Example error handling:

```typescript
import { RateLimitException } from '@skills-base/shared;

@Catch(RateLimitException)
export class RateLimitExceptionFilter implements ExceptionFilter {
  catch(exception: RateLimitException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    response.status(429).json({
      statusCode: 429,
      message: 'Too Many Requests',
      retryAfter: '60 seconds',
    });
  }
}
```

## Testing

```typescript
describe('SecurityModule', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        SecurityModule.forRoot({
          rateLimit: { enabled: true, windowMs: 1000, max: 1 },
          apiKey: { enabled: true, keys: ['test-key'] },
          ipWhitelist: { enabled: false, allowedIps: [] },
          payloadLimit: { maxSize: 1024 },
        }),
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('should block requests exceeding rate limit', () => {
    // ... test implementation
  });
});
```
