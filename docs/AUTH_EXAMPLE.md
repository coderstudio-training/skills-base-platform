# Authentication Implementation Example

This example shows a practical implementation of authentication and RBAC in a NestJS service.

## Example Service Structure

```
your-service/
├── src/
│   ├── items/
│   │   ├── items.controller.ts    # Protected controller example
│   │   ├── items.service.ts       # Business logic
│   │   └── items.module.ts        # Module configuration
│   ├── app.module.ts
│   └── main.ts
```

## Implementation Example

### 1. items.controller.ts

```typescript
import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '@skills-base/shared/guards';
import { Roles } from '@skills-base/shared/decorators';
import { UserRole } from '@skills-base/shared/constants';
import { ItemsService } from './items.service';

@Controller('items')
export class ItemsController {
  constructor(private itemsService: ItemsService) {}

  // Public route - no authentication needed
  @Get('public')
  getPublicItems() {
    return this.itemsService.getPublicItems();
  }

  // Protected route - any authenticated user
  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getProtectedItems(@Request() req) {
    // req.user contains the authenticated user data
    return this.itemsService.getProtectedItems(req.user.userId);
  }

  // Admin only route
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin')
  adminOperation(@Body() data: any) {
    return this.itemsService.adminOperation(data);
  }

  // Manager or Admin route
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @Get('reports')
  getReports() {
    return this.itemsService.getReports();
  }
}
```

### 2. items.module.ts

```typescript
import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';

@Module({
  controllers: [ItemsController],
  providers: [ItemsService],
})
export class ItemsModule {}
```

### 3. app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ItemsModule } from './items/items.module';

@Module({
  imports: [
    ConfigModule.forRoot(), // Loads .env file
    ItemsModule,
  ],
})
export class AppModule {}
```

### 4. .env file

```env
JWT_SECRET=your_jwt_secret  # Must match user-service JWT_SECRET
```

## Testing the Implementation

### 1. Unit Test Example

```typescript
import { Test } from '@nestjs/testing';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { UserRole } from '@skills-base/shared/constants';

describe('ItemsController', () => {
  let controller: ItemsController;
  let service: ItemsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [
        {
          provide: ItemsService,
          useValue: {
            getProtectedItems: jest.fn(),
            adminOperation: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(ItemsController);
    service = module.get(ItemsService);
  });

  it('should allow admin access', () => {
    const mockRequest = {
      user: {
        userId: 'test-id',
        roles: [UserRole.ADMIN],
      },
    };

    controller.adminOperation.bind(controller)(mockRequest);
    expect(service.adminOperation).toHaveBeenCalled();
  });
});
```

### 2. E2E Test Example

```typescript
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Authentication (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should require authentication', () => {
    return request(app.getHttpServer()).get('/items/protected').expect(401); // Unauthorized
  });

  it('should allow authenticated access', () => {
    const validToken = 'your-valid-jwt-token';
    return request(app.getHttpServer())
      .get('/items/protected')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
  });
});
```

## Using the Protected Endpoints

### 1. Making Authenticated Requests

```typescript
// Frontend example using fetch
const makeAuthenticatedRequest = async (endpoint, options = {}) => {
  const token = 'your-jwt-token';
  const response = await fetch(`http://your-service/${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

// Example usage
const protectedData = await makeAuthenticatedRequest('items/protected');
```

This example demonstrates:

- Different levels of protection (public, authenticated, role-based)
- Proper guard usage
- Access to user data in controllers
- Testing protected routes
- Frontend integration
