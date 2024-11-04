# Creating a New Service Module Guide

This guide explains how to create a new service module with CRUD operations in the Skills Base platform, following the established patterns and integrating with the authentication system.

## Step 1: Create Module Structure

Create the following directory structure in your service:

```
src/
└── your-feature/
    ├── dto/
    │   ├── create-feature.dto.ts
    │   ├── update-feature.dto.ts
    │   └── index.ts
    ├── entities/
    │   └── feature.entity.ts
    ├── your-feature.controller.ts
    ├── your-feature.service.ts
    └── your-feature.module.ts
```

## Step 2: Define Entity

```typescript
// src/your-feature/entities/feature.entity.ts
import { BaseEntity } from '@skills-base/shared';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class YourFeature extends BaseEntity {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: String, ref: 'User' })
  createdBy: string;
}

export const YourFeatureSchema = SchemaFactory.createForClass(YourFeature);
```

## Step 3: Create DTOs

```typescript
// src/your-feature/dto/create-feature.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFeatureDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

// src/your-feature/dto/update-feature.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateFeatureDto } from './create-feature.dto';

export class UpdateFeatureDto extends PartialType(CreateFeatureDto) {}

// src/your-feature/dto/index.ts
export * from './create-feature.dto';
export * from './update-feature.dto';
```

## Step 4: Implement Service

```typescript
// src/your-feature/your-feature.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '@skills-base/shared';
import { YourFeature } from './entities/feature.entity';
import { CreateFeatureDto, UpdateFeatureDto } from './dto';

@Injectable()
export class YourFeatureService extends BaseService<YourFeature> {
  constructor(
    @InjectModel(YourFeature.name)
    private featureModel: Model<YourFeature>,
  ) {
    super(featureModel);
  }

  // Override or add custom methods as needed
  async create(createDto: CreateFeatureDto, userId: string): Promise<YourFeature> {
    const createdFeature = new this.featureModel({
      ...createDto,
      createdBy: userId,
    });
    return createdFeature.save();
  }

  // Add custom business logic methods here
}
```

## Step 5: Implement Controller

```typescript
// src/your-feature/your-feature.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '@skills-base/shared/guards';
import { Roles } from '@skills-base/shared/decorators';
import { UserRole } from '@skills-base/shared/constants';
import { YourFeatureService } from './your-feature.service';
import { CreateFeatureDto, UpdateFeatureDto } from './dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('your-feature')
export class YourFeatureController {
  constructor(private readonly featureService: YourFeatureService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async create(@Body() createDto: CreateFeatureDto, @Request() req) {
    return this.featureService.create(createDto, req.user.userId);
  }

  @Get()
  @Roles(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN)
  async findAll() {
    return this.featureService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN)
  async findOne(@Param('id') id: string) {
    return this.featureService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async update(@Param('id') id: string, @Body() updateDto: UpdateFeatureDto) {
    return this.featureService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.featureService.remove(id);
  }
}
```

## Step 6: Create Module

```typescript
// src/your-feature/your-feature.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { YourFeatureController } from './your-feature.controller';
import { YourFeatureService } from './your-feature.service';
import { YourFeature, YourFeatureSchema } from './entities/feature.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: YourFeature.name, schema: YourFeatureSchema }])],
  controllers: [YourFeatureController],
  providers: [YourFeatureService],
  exports: [YourFeatureService],
})
export class YourFeatureModule {}
```

## Step 7: Register in App Module

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { YourFeatureModule } from './your-feature/your-feature.module';

@Module({
  imports: [
    // ... other imports
    YourFeatureModule,
  ],
})
export class AppModule {}
```

## Step 8: Add API Documentation

```typescript
// src/your-feature/your-feature.controller.ts
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('your-feature')
@Controller('your-feature')
export class YourFeatureController {
  @ApiOperation({ summary: 'Create new feature' })
  @ApiResponse({ status: 201, description: 'Feature created successfully' })
  @Post()
  async create() {
    // ... implementation
  }

  // Add documentation for other endpoints
}
```

## Step 9: Add Tests

```typescript
// src/your-feature/your-feature.service.spec.ts
import { Test } from '@nestjs/testing';
import { YourFeatureService } from './your-feature.service';

describe('YourFeatureService', () => {
  let service: YourFeatureService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        YourFeatureService,
        {
          provide: getModelToken(YourFeature.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<YourFeatureService>(YourFeatureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more tests
});
```

## Role-Based Access Control

The module implements RBAC using the shared guards:

1. **Read Operations** (GET)

   - Accessible by all authenticated users (USER, MANAGER, ADMIN)

2. **Write Operations** (POST, PATCH)

   - Limited to MANAGER and ADMIN roles

3. **Delete Operations**
   - Restricted to ADMIN role only

## Error Handling

The base service includes standard error handling:

- Not Found (404)
- Unauthorized (401)
- Forbidden (403)
- Validation errors (400)

Add custom error handling as needed:

```typescript
import { NotFoundException, ForbiddenException } from '@nestjs/common';

@Injectable()
export class YourFeatureService extends BaseService<YourFeature> {
  async customMethod() {
    try {
      // Implementation
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Handle not found
      }
      throw error;
    }
  }
}
```

## Best Practices

1. **Validation**

   - Use class-validator decorators in DTOs
   - Add custom validators as needed

2. **Security**

   - Always use @UseGuards(JwtAuthGuard, RolesGuard)
   - Implement proper role checks
   - Validate user permissions

3. **Documentation**

   - Use Swagger decorators
   - Document all endpoints and DTOs
   - Include example responses

4. **Testing**

   - Write unit tests for service
   - Write e2e tests for endpoints
   - Test role-based access

5. **Error Handling**
   - Use specific exception types
   - Include meaningful error messages
   - Log errors appropriately
