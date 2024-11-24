# Swagger Documentation Implementation Guide

This guide explains how to implement comprehensive API documentation using Swagger/OpenAPI in your NestJS microservice using the shared swagger utilities.

## Prerequisites

1. Your service must have `@skills-base/shared` as a dependency:

```json
{
  "dependencies": {
    "@skills-base/shared": "^1.0.0"
  }
}
```

2. Required imports:

```typescript
import { SwaggerHelper } from '@skills-base/shared';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
```

## Step 1: Basic Setup

### Initialize Swagger in your application

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerHelper } from '@skills-base/shared';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  SwaggerHelper.setup(
    app,
    'Your Service Name',
    'api-docs', // documentation path
  );

  await app.listen(3000);
}
```

## Step 2: Document DTOs

### Basic DTO Documentation

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
    format: 'email',
  })
  email: string;

  @ApiProperty({
    description: 'The user password',
    minLength: 8,
    writeOnly: true,
  })
  password: string;

  @ApiProperty({
    description: 'User role',
    enum: ['user', 'admin'],
    default: 'user',
  })
  role: string;
}
```

### Advanced DTO Documentation

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdvancedDto {
  @ApiProperty({
    type: [String],
    isArray: true,
    description: 'Array of tags',
    example: ['tag1', 'tag2'],
  })
  tags: string[];

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: {
      type: 'string',
    },
    description: 'Custom metadata key-value pairs',
    example: {
      region: 'US',
      tier: 'premium',
    },
  })
  metadata?: Record<string, string>;
}
```

## Step 3: Document Controllers

### Basic Controller Documentation

```typescript
@ApiTags('Users')
@Controller('users')
export class UsersController {
  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    type: CreateUserDto,
  })
  create(@Body() createUserDto: CreateUserDto) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '123',
  })
  findOne(@Param('id') id: string) {}
}
```

### Advanced Controller Documentation

```typescript
@ApiTags('Advanced Operations')
@Controller('advanced')
export class AdvancedController {
  @Post('bulk')
  @ApiOperation({
    summary: 'Bulk operation',
    description: 'Performs bulk operation with detailed response',
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        metadata: {
          type: 'object',
          properties: {
            description: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Successful operation',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        processed: { type: 'number' },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              line: { type: 'number' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
  })
  bulkOperation() {}
}
```

## Step 4: Document Authentication

### JWT Authentication

```typescript
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
      },
    },
  })
  login(@Body() loginDto: LoginDto) {}

  @Get('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  getProfile(@Request() req) {}
}
```

### API Key Authentication

```typescript
@ApiTags('API')
@Controller('api')
export class ApiController {
  @Get('data')
  @ApiSecurity('x-api-key')
  @ApiOperation({ summary: 'Get API data' })
  @UseGuards(ApiKeyGuard)
  getData() {}
}
```

## Swagger Decorators Reference

### Property Decorators

```typescript
// Basic property
@ApiProperty({
  description: string,
  required?: boolean,
  type?: any,
  isArray?: boolean,
  enum?: any[],
  default?: any,
  example?: any
})

// Optional property
@ApiPropertyOptional()

// Hidden property
@ApiHideProperty()

// Extra models
@ApiExtraModels(ExtraModel)
```

### Operation Decorators

```typescript
// Tag groups
@ApiTags('group-name')

// Operation metadata
@ApiOperation({
  summary: string,
  description?: string,
  deprecated?: boolean,
  operationId?: string
})

// Response documentation
@ApiResponse({
  status: number,
  description: string,
  type?: any,
  content?: object
})

// Common responses
@ApiOkResponse()
@ApiCreatedResponse()
@ApiAcceptedResponse()
@ApiBadRequestResponse()
@ApiUnauthorizedResponse()
@ApiForbiddenResponse()
@ApiNotFoundResponse()

// Parameters
@ApiParam()
@ApiQuery()
@ApiHeader()
@ApiBody()
```

## Best Practices

1. Documentation Organization:

   - Use meaningful tags to group endpoints
   - Provide clear operation summaries
   - Include detailed descriptions for complex operations
   - Document all possible response scenarios

2. DTO Documentation:

   - Include examples for all properties
   - Document validation constraints
   - Use appropriate types and formats
   - Mark sensitive fields appropriately

3. Authentication Documentation:

   - Clearly mark authenticated endpoints
   - Document security schemes
   - Include token/key requirements
   - Document permission requirements

4. Response Documentation:

   - Document all possible response codes
   - Include response schemas
   - Provide examples for complex responses
   - Document error responses

5. General Best Practices:
   - Keep documentation up to date
   - Use consistent naming conventions
   - Include pagination details
   - Document rate limits

## Common Issues and Solutions

1. Swagger UI not showing:

   ```typescript
   // Ensure proper setup in main.ts
   SwaggerHelper.setup(app, 'API Title', 'api-docs');
   ```

2. Arrays not displaying correctly:

   ```typescript
   @ApiProperty({
     isArray: true,
     type: () => YourType
   })
   items: YourType[];
   ```

3. Circular dependencies:

   ```typescript
   @ApiExtraModels(ReferencedModel)
   @ApiProperty({
     type: () => ReferencedModel
   })
   ```

4. Enum documentation:
   ```typescript
   @ApiProperty({
     enum: YourEnum,
     enumName: 'YourEnum'
   })
   ```

## Testing Documentation

### Validation Testing

```typescript
describe('API Documentation', () => {
  it('should have valid swagger JSON', async () => {
    const response = await request(app.getHttpServer()).get('/api-docs/json').expect(200);

    const validate = require('swagger-parser').validate;
    await validate(response.body);
  });
});
```

## Advanced Documentation Features

### 1. File Upload Documentation

```typescript
@ApiTags('Files')
@Controller('files')
export class FileController {
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
        description: {
          type: 'string',
          description: 'File description',
        },
        tags: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'File tags',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        url: { type: 'string' },
        size: { type: 'number' },
      },
    },
  })
  uploadFile(@UploadedFile() file: Express.Multer.File) {}
}
```

### 2. Pagination Documentation

```typescript
// pagination.dto.ts
export class PaginationQueryDto {
  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
    description: 'Page number',
  })
  page?: number;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 100,
    default: 10,
    description: 'Items per page',
  })
  limit?: number;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'createdAt',
  })
  sortBy?: string;

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    default: 'desc',
    description: 'Sort direction',
  })
  sortOrder?: 'asc' | 'desc';
}

// paginated-response.decorator.ts
export const ApiPaginatedResponse = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        allOf: [
          {
            properties: {
              items: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              meta: {
                type: 'object',
                properties: {
                  totalItems: {
                    type: 'number',
                    example: 100,
                  },
                  itemsPerPage: {
                    type: 'number',
                    example: 10,
                  },
                  totalPages: {
                    type: 'number',
                    example: 10,
                  },
                  currentPage: {
                    type: 'number',
                    example: 1,
                  },
                },
              },
            },
          },
        ],
      },
    }),
  );
};
```

### 3. Complex Request/Response Documentation

```typescript
// Complex nested DTOs
export class AddressDto {
  @ApiProperty({
    description: 'Street address',
    example: '123 Main St',
  })
  street: string;

  @ApiProperty({
    description: 'City',
    example: 'New York',
  })
  city: string;

  @ApiProperty({
    description: 'Country code',
    example: 'US',
    minLength: 2,
    maxLength: 2,
  })
  country: string;

  @ApiProperty({
    description: 'Postal code',
    example: '10001',
  })
  postalCode: string;
}

export class OrderItemDto {
  @ApiProperty({
    description: 'Product ID',
    example: 'prod_123',
  })
  productId: string;

  @ApiProperty({
    description: 'Quantity',
    minimum: 1,
    example: 2,
  })
  quantity: number;

  @ApiPropertyOptional({
    description: 'Special instructions',
    example: 'Gift wrap',
  })
  instructions?: string;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Customer ID',
    example: 'cust_123',
  })
  customerId: string;

  @ApiProperty({
    type: [OrderItemDto],
    description: 'Order items',
  })
  items: OrderItemDto[];

  @ApiProperty({
    type: AddressDto,
    description: 'Shipping address',
  })
  shippingAddress: AddressDto;

  @ApiPropertyOptional({
    type: AddressDto,
    description: 'Billing address (if different from shipping)',
  })
  billingAddress?: AddressDto;
}

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  @Post()
  @ApiOperation({
    summary: 'Create new order',
    description: 'Creates a new order with items and shipping information',
  })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    schema: {
      type: 'object',
      properties: {
        orderId: {
          type: 'string',
          example: 'ord_123',
        },
        status: {
          type: 'string',
          enum: ['pending', 'processing', 'shipped'],
          example: 'pending',
        },
        total: {
          type: 'number',
          example: 99.99,
        },
        estimatedDelivery: {
          type: 'string',
          format: 'date-time',
          example: '2024-12-01T12:00:00Z',
        },
      },
    },
  })
  createOrder(@Body() createOrderDto: CreateOrderDto) {}
}
```

### 4. Security Schemes Documentation

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  SwaggerHelper.setup(app, 'Your API', {
    securitySchemes: {
      bearer: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
      apiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'API key for service access',
      },
    },
    security: [{ bearer: [] }, { apiKey: [] }],
  });

  await app.listen(3000);
}
```

### 5. Enum Documentation

```typescript
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export class OrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    enumName: 'OrderStatus',
    description: 'Current status of the order',
    example: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @ApiPropertyOptional({
    description: 'Status change reason',
    example: 'Customer requested cancellation',
  })
  statusReason?: string;
}
```

## API Documentation Organization

### 1. Tags and Groups

```typescript
// Organization by domain
@ApiTags('Users')
@Controller('users')
export class UsersController {}

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {}

@ApiTags('Products')
@Controller('products')
export class ProductsController {}

// Organization by access level
@ApiTags('Public')
@Controller('public')
export class PublicController {}

@ApiTags('Admin')
@Controller('admin')
export class AdminController {}
```

### 2. Descriptions and Examples

```typescript
@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  @Get('revenue')
  @ApiOperation({
    summary: 'Get revenue analytics',
    description: `
      Retrieves revenue analytics for a specified time period.
      
      Supports the following aggregations:
      - Daily
      - Weekly
      - Monthly
      - Quarterly
      
      Data includes:
      - Total revenue
      - Average order value
      - Number of orders
      - Revenue by product category
    `,
  })
  @ApiQuery({
    name: 'startDate',
    required: true,
    description: 'Start date for analytics (ISO format)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    description: 'End date for analytics (ISO format)',
    example: '2024-12-31',
  })
  @ApiQuery({
    name: 'aggregation',
    enum: ['daily', 'weekly', 'monthly', 'quarterly'],
    description: 'Aggregation level for the data',
  })
  getRevenueAnalytics() {}
}
```

## Documentation Maintenance

### 1. Version Management

```typescript
SwaggerHelper.setup(app, 'Your API', {
  version: process.env.API_VERSION || '1.0.0',
  description: `
    API Version: ${process.env.API_VERSION}
    Last Updated: ${new Date().toISOString()}
    
    Change Log:
    - v1.0.0: Initial release
    - v1.1.0: Added analytics endpoints
    - v1.2.0: Added bulk operations
  `,
});
```

### 2. Deprecation Marking

```typescript
@ApiTags('Legacy')
@Controller('v1/legacy')
export class LegacyController {
  @Get('old-endpoint')
  @ApiOperation({
    summary: 'Get legacy data',
    deprecated: true,
    description: 'This endpoint is deprecated and will be removed in v2.0.0. Use /v2/data instead.',
  })
  @ApiResponse({
    status: 200,
    description: 'Legacy response format',
    schema: {
      deprecated: true,
    },
  })
  getLegacyData() {}
}
```
