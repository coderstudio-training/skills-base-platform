# Skills Base Shared Package

This package contains shared utilities, interfaces, and components used across the Skills Base platform microservices. It provides a foundation for building consistent and efficient services within our microservices architecture.

## Table of Contents

1. [Package Structure](#package-structure)
2. [Components](#components)
3. [Setup](#setup)
4. [Usage](#usage)
5. [Best Practices](#best-practices)
6. [Contributing](#contributing)

## Package Structure

```
packages/shared/
├── src/
│   ├── base/
│   ├── config/
│   ├── constants/
│   ├── database/
│   ├── decorators/
│   ├── dto/
│   ├── entities/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── interfaces/
│   ├── messaging/
│   ├── middlewares/
│   ├── utils/
│   └── index.ts
├── test/
├── package.json
└── tsconfig.json
```

## Components

### Base

Contains base classes for controllers and services, providing common CRUD operations.

- `base.controller.ts`: Abstract base controller with common REST endpoints.
- `base.service.ts`: Abstract base service with common database operations.

### Config

Configuration files for various services and modules.

- `database.config.ts`: Database connection configuration.
- `app.config.ts`: General application configuration.

### Constants

Constant values used across the platform.

- `error-codes.constant.ts`: Standardized error codes.
- `roles.constant.ts`: User role definitions.

### Database

Database-related modules and configurations.

- `database.module.ts`: NestJS module for database connections.

### Decorators

Custom decorators for use in controllers and services.

- `roles.decorator.ts`: Decorator for role-based access control.
- `validate.decorator.ts`: Decorator for DTO validation.

### DTO (Data Transfer Objects)

DTOs define the structure of data for API requests and responses.

- `pagination.dto.ts`: DTO for paginated responses.
- `base.dto.ts`: Base DTO with common fields.

### Entities

Base entities and shared MongoDB schemas.

- `base.entity.ts`: Base entity with common fields (e.g., createdAt, updatedAt).

### Filters

Exception filters for standardized error handling.

- `http-exception.filter.ts`: Global HTTP exception filter.

### Guards

Authentication and authorization guards.

- `jwt-auth.guard.ts`: JWT authentication guard.
- `roles.guard.ts`: Role-based authorization guard.

### Interceptors

Interceptors for request/response transformation and logging.

- `logging.interceptor.ts`: Request/response logging interceptor.
- `transform.interceptor.ts`: Response data transformation interceptor.

### Interfaces

TypeScript interfaces for shared data structures.

- `user.interface.ts`: User data interface.
- `config.interface.ts`: Configuration interfaces.

### Messaging

Services for inter-service communication.

- `messaging.service.ts`: Service for sending and receiving messages via RabbitMQ.

### Middlewares

Shared middleware functions.

- `logger.middleware.ts`: Request logging middleware.

### Utils

Utility functions and helper methods.

- `validation.util.ts`: Data validation utilities.
- `date.util.ts`: Date manipulation utilities.

## Setup

1. Install the package in your service:

   ```
   npm install @skills-base/shared
   ```

2. Add the shared package to your `tsconfig.json`:

   ```json
   {
     "compilerOptions": {
       "paths": {
         "@skills-base/shared": ["../shared/src"]
       }
     }
   }
   ```

3. Import and use the shared components in your service.

## Usage

Here are some examples of how to use the shared components in your services:

1. Extending the base controller:

```typescript
import { Controller } from '@nestjs/common';
import { BaseController } from '@skills-base/shared';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController extends BaseController<User> {
  constructor(private readonly usersService: UsersService) {
    super(usersService);
  }

  // Add user-specific methods here
}
```

2. Using the database module:

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from '@skills-base/shared';
import { UsersModule } from './users/users.module';

@Module({
  imports: [DatabaseModule, UsersModule],
})
export class AppModule {}
```

3. Implementing the messaging service:

```typescript
import { Injectable } from '@nestjs/common';
import { MessagingService } from '@skills-base/shared';

@Injectable()
export class NotificationService {
  constructor(private messagingService: MessagingService) {}

  async sendNotification(userId: string, message: string) {
    await this.messagingService.emit('notification.created', {
      userId,
      message,
    });
  }
}
```

## Best Practices

1. Always extend the base classes (BaseController, BaseService) when creating new controllers and services.
2. Use the shared DTOs and entities as a foundation for your service-specific DTOs and entities.
3. Implement the provided guards and interceptors for consistent authentication and request/response handling.
4. Utilize the messaging service for all inter-service communication.
5. Add new shared components to this package when they are used across multiple services.

## Contributing

1. Create a new branch for your feature or bug fix.
2. Make your changes and add appropriate tests.
3. Run the test suite to ensure all tests pass.
4. Submit a pull request with a clear description of your changes.

When adding new components to the shared package, ensure they are truly shared across multiple services and not specific to a single service.

For any questions or concerns, please contact the platform architecture team.
