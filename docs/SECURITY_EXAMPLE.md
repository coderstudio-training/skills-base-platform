# Security Implementation Example

This example demonstrates a practical implementation of security features in a NestJS service using the shared security module.

## Example Service Structure

```
your-service/
├── src/
│   ├── items/
│   │   ├── items.controller.ts    # Protected endpoints example
│   │   ├── items.service.ts       # Business logic
│   │   └── items.module.ts        # Module configuration
│   ├── app.module.ts
│   └── main.ts
```

## Implementation Example

### 1. items.controller.ts

```typescript
import { Controller, Get, Post, Body } from '@nestjs/common';
import { RequireApiKey, RateLimit } from '@skills-base/shared';
import { ItemsService } from './items.service';

@Controller('items')
export class ItemsController {
  constructor(private itemsService: ItemsService) {}

  // Public route - only rate limited
  @RateLimit({ max: 100, windowMs: 15 * 60 * 1000 }) // 100 requests per 15 minutes
  @Get('public')
  getPublicItems() {
    return this.itemsService.getPublicItems();
  }

  // Protected route - requires API key
  @RequireApiKey()
  @Get('protected')
  getProtectedItems() {
    return this.itemsService.getProtectedItems();
  }

  // Combined protection - API key and strict rate limit
  @RequireApiKey()
  @RateLimit({ max: 10, windowMs: 60 * 1000 }) // 10 requests per minute
  @Post('sensitive')
  sensitiveOperation(@Body() data: any) {
    return this.itemsService.sensitiveOperation(data);
  }
}
```

### 2. app.module.ts (required)

```typescript
import { Module } from '@nestjs/common';
import { SecurityModule } from '@skills-base/shared';
import { ItemsModule } from './items/items.module';

@Module({
  imports: [
    SecurityModule.forRoot({
      rateLimit: {
        enabled: true,
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
      },
      apiKey: {
        enabled: true,
        keys: ['your-api-key-1', 'your-api-key-2'],
      },
      ipWhitelist: {
        enabled: true,
        allowedIps: ['192.168.1.1', '10.0.0.1'],
      },
    }),
    ItemsModule,
  ],
})
export class AppModule {}
```

### 3. .env file (optional)

```env
API_KEYS=key1,key2,key3
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
IP_WHITELIST_ENABLED=true
ALLOWED_IPS=192.168.1.1,10.0.0.1
```

## Testing the Implementation

### 1. Unit Test Example

```typescript
import { Test } from '@nestjs/testing';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { SecurityMonitoringService } from '@skills-base/shared';

describe('ItemsController', () => {
  let controller: ItemsController;
  let securityMonitoring: SecurityMonitoringService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [
        {
          provide: ItemsService,
          useValue: {
            getProtectedItems: jest.fn(),
            sensitiveOperation: jest.fn(),
          },
        },
        SecurityMonitoringService,
      ],
    }).compile();

    controller = module.get(ItemsController);
    securityMonitoring = module.get(SecurityMonitoringService);
  });

  it('should track security events', () => {
    const spy = jest.spyOn(securityMonitoring, 'trackThreatEvent');
    // Test your secured endpoints
    expect(spy).toHaveBeenCalled();
  });
});
```

### 2. E2E Test Example

```typescript
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Security Features (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should require API key', () => {
    return request(app.getHttpServer()).get('/items/protected').expect(403); // Forbidden
  });

  it('should allow access with valid API key', () => {
    return request(app.getHttpServer())
      .get('/items/protected')
      .set('x-api-key', 'valid-api-key')
      .expect(200);
  });

  it('should enforce rate limits', async () => {
    const endpoint = '/items/sensitive';
    const validKey = 'valid-api-key';

    // Make multiple requests
    for (let i = 0; i < 11; i++) {
      const response = await request(app.getHttpServer()).post(endpoint).set('x-api-key', validKey);

      if (i < 10) {
        expect(response.status).toBe(200);
      } else {
        expect(response.status).toBe(429); // Too Many Requests
      }
    }
  });
});
```

## Using the Protected Endpoints

### Making Secured Requests

```typescript
// Frontend example using fetch
const makeSecuredRequest = async (endpoint, options = {}) => {
  const API_KEY = 'your-api-key';
  const response = await fetch(`http://your-service/${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'x-api-key': API_KEY,
    },
  });
  return response.json();
};

// Example usage
const protectedData = await makeSecuredRequest('items/protected');
```

This example demonstrates:

- Rate limiting configuration and usage
- API key protection
- IP whitelist implementation
- Security monitoring integration
- Testing secured endpoints
- Frontend integration
