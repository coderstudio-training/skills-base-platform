# Logging Implementation Example

This example shows a practical implementation of logging in a NestJS service using the shared logging system.

## Example Service Structure

```
your-service/
├── src/
│   ├── items/
│   │   ├── items.controller.ts    # Controller with logging examples
│   │   ├── items.service.ts       # Service with logging
│   │   └── items.module.ts        # Module with logging configuration
│   ├── app.module.ts
│   └── main.ts
```

## Implementation Example

### 1. items.controller.ts

```typescript
import { Controller, Get, Post, Body } from '@nestjs/common';
import { Logger } from '@skills-base/shared';
import { ItemsService } from './items.service';

@Controller('items')
export class ItemsController {
  private readonly logger: Logger;

  constructor(private itemsService: ItemsService) {
    this.logger = new Logger('ItemsController');
  }

  @Get()
  async findAll() {
    this.logger.info('Fetching all items', {
      type: 'items.list',
      userId: 'system',
    });

    try {
      const items = await this.itemsService.findAll();
      this.logger.debug('Items retrieved successfully', {
        count: items.length,
      });
      return items;
    } catch (error) {
      this.logger.error(error, {
        type: 'items.list.error',
        userId: 'system',
      });
      throw error;
    }
  }

  @Post()
  async create(@Body() item: any) {
    this.logger.info('Creating new item', {
      type: 'items.create',
      metadata: { itemType: item.type },
    });

    try {
      const result = await this.itemsService.create(item);
      this.logger.info('Item created successfully', {
        type: 'items.create.success',
        itemId: result.id,
      });
      return result;
    } catch (error) {
      this.logger.error(error, {
        type: 'items.create.error',
        metadata: { itemData: item },
      });
      throw error;
    }
  }
}
```

### 2. items.service.ts

```typescript
import { Injectable } from '@nestjs/common';
import { Logger } from '@skills-base/shared';

@Injectable()
export class ItemsService {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger('ItemsService');
  }

  async findAll() {
    this.logger.debug('Querying database for items');

    try {
      // Database operation here
      const items = [
        /* items */
      ];

      this.logger.debug('Database query completed', {
        count: items.length,
        duration: 100, // Example duration
      });

      return items;
    } catch (error) {
      this.logger.error(error, {
        type: 'database.query.error',
        operation: 'findAll',
      });
      throw error;
    }
  }

  async create(item: any) {
    this.logger.debug('Creating new item in database', {
      itemType: item.type,
    });

    try {
      // Database operation here
      const result = { id: 'new-id', ...item };

      this.logger.info('Item persisted to database', {
        type: 'database.write.success',
        itemId: result.id,
      });

      return result;
    } catch (error) {
      this.logger.error(error, {
        type: 'database.write.error',
        operation: 'create',
      });
      throw error;
    }
  }
}
```

### 3. items.module.ts

```typescript
import { Module } from '@nestjs/common';
import { LoggingModule } from '@skills-base/shared';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';

@Module({
  imports: [
    LoggingModule.forFeature({
      serviceName: 'items-service',
    }),
  ],
  controllers: [ItemsController],
  providers: [ItemsService],
})
export class ItemsModule {}
```

### 4. app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { LoggingModule } from '@skills-base/shared';
import { ItemsModule } from './items/items.module';

@Module({
  imports: [
    LoggingModule.forRoot({
      serviceName: 'my-service',
      environment: process.env.NODE_ENV,
      enableGlobalInterceptor: true,
    }),
    ItemsModule,
  ],
})
export class AppModule {}
```

## Testing with Logs

### 1. Unit Test Example

```typescript
import { Test } from '@nestjs/testing';
import { Logger } from '@skills-base/shared';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';

describe('ItemsController', () => {
  let controller: ItemsController;
  let logger: Logger;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [
        {
          provide: ItemsService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
          },
        },
        Logger,
      ],
    }).compile();

    controller = module.get(ItemsController);
    logger = module.get(Logger);
    jest.spyOn(logger, 'info');
    jest.spyOn(logger, 'error');
  });

  it('should log item creation', async () => {
    const item = { type: 'test' };
    await controller.create(item);

    expect(logger.info).toHaveBeenCalledWith(
      'Creating new item',
      expect.objectContaining({
        type: 'items.create',
        metadata: { itemType: 'test' },
      }),
    );
  });
});
```

### 2. E2E Test Example

```typescript
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Logger } from '@skills-base/shared';
import { AppModule } from '../src/app.module';

describe('Logging (e2e)', () => {
  let app: INestApplication;
  let logger: Logger;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    logger = moduleFixture.get(Logger);
    await app.init();
  });

  it('should log HTTP requests', async () => {
    const spy = jest.spyOn(logger, 'info');

    await request(app.getHttpServer()).get('/items').expect(200);

    expect(spy).toHaveBeenCalledWith(expect.stringContaining('GET /items'), expect.any(Object));
  });
});
```

## Viewing Logs

### 1. Development Environment

Logs will be written to:

- Console in formatted text
- `logs/dev/dev-YYYY-MM-DD.log` files

Example console output:

```
2024-11-24 13:27:47.123 INFO  items-service (ItemsController) ℹ  Fetching all items
2024-11-24 13:27:47.125 DEBUG items-service (ItemsService)   ⚙  Querying database for items
2024-11-24 13:27:47.230 INFO  items-service (ItemsService)   ℹ  Items retrieved successfully
```

### 2. Production Environment

Logs will be written to:

- JSON format for better parsing
- `/var/log/app/app-YYYY-MM-DD-HH.log`
- Loki if configured

Example JSON log:

```json
{
  "level": "info",
  "message": "Fetching all items",
  "timestamp": "2024-11-24T13:27:47.123Z",
  "service": "items-service",
  "type": "items.list",
  "userId": "system",
  "correlationId": "abc-123"
}
```

This example demonstrates:

- Service-level and feature-level logging configuration
- Structured logging with context
- Error handling with proper logging
- Testing log output
- Different logging formats for different environments
