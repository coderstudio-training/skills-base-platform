# Swagger Documentation Example

This example demonstrates a practical implementation of Swagger/OpenAPI documentation in a NestJS service using the shared swagger utilities.

## Example Service Structure

```
your-service/
├── src/
│   ├── items/
│   │   ├── dto/
│   │   │   ├── create-item.dto.ts
│   │   │   └── update-item.dto.ts
│   │   ├── items.controller.ts    # Documented controller
│   │   ├── items.service.ts
│   │   └── items.module.ts
│   ├── app.module.ts
│   └── main.ts
```

## Implementation Example

### 1. DTOs with Swagger Decorators

```typescript
// src/items/dto/create-item.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateItemDto {
  @ApiProperty({
    description: 'The name of the item',
    example: 'Premium Widget',
    minLength: 3,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The price of the item in USD',
    example: 29.99,
    minimum: 0,
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Optional description of the item',
    example: 'A high-quality widget for professional use',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
```

### 2. Documented Controller

```typescript
// src/items/items.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@skills-base/shared';
import { CreateItemDto } from './dto/create-item.dto';
import { ItemsService } from './items.service';

@ApiTags('Items')
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new item' })
  @ApiResponse({
    status: 201,
    description: 'The item has been successfully created.',
    type: CreateItemDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data.',
  })
  @ApiForbiddenResponse({ description: 'Unauthorized access' })
  create(@Body() createItemDto: CreateItemDto) {
    return this.itemsService.create(createItemDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an item by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the item',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'The found item',
    type: CreateItemDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Item not found',
  })
  findOne(@Param('id') id: string) {
    return this.itemsService.findOne(id);
  }
}
```

### 3. Main Application Setup (Required)

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerHelper } from '@skills-base/shared';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Setup Swagger documentation
  SwaggerHelper.setup(
    app,
    'Items Service API', // Name of your Swagger Document
    'swagger', // Access swagger at /swagger
  );

  await app.listen(3000);
}
bootstrap();
```

### 4. API Models/Interfaces

```typescript
// src/items/interfaces/item.interface.ts
import { ApiProperty } from '@nestjs/swagger';

export class Item {
  @ApiProperty({
    description: 'The unique identifier of the item',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  price: number;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({
    description: 'The creation timestamp',
    example: '2024-11-24T12:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The last update timestamp',
    example: '2024-11-24T12:00:00Z',
  })
  updatedAt: Date;
}
```

## Testing the Documentation

### 1. E2E Test Example

```typescript
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Swagger Documentation (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should serve swagger documentation', () => {
    return request(app.getHttpServer())
      .get('/api-docs/json')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  it('should serve swagger UI', () => {
    return request(app.getHttpServer())
      .get('/api-docs')
      .expect(200)
      .expect('Content-Type', /text\/html/);
  });
});
```

## Example API Documentation Output

The above implementation will generate Swagger documentation accessible at `http://your-service/api-docs` with:

1. Authentication Requirements:

   - Bearer token requirements clearly marked
   - API key requirements (if any)

2. Endpoint Documentation:

   - All available endpoints
   - Required parameters
   - Request/response schemas
   - Example values
   - Possible response codes

3. Interactive Testing:
   - Try-it-out functionality
   - Authentication input
   - Request builders
   - Response viewers

This example demonstrates:

- Proper DTO documentation
- Controller endpoint documentation
- Authentication documentation
- Parameter and response documentation
- Interactive testing setup
- Error response documentation
