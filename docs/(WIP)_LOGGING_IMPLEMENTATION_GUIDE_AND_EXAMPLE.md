# Logging Implementation Guide and Example

## Minimal Implementation

### 1. Basic Module Setup

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { LoggingModule } from '@skills-base/shared';

@Module({
  imports: [
    LoggingModule.forRoot({
      serviceName: 'my-service',
    }),
  ],
})
export class AppModule {}
```

### 2. Creating Logger Instances

There are several ways to create a logger instance:

```typescript
// 1. Constructor injection (Recommended for services/controllers)
import { Injectable } from '@nestjs/common';
import { Logger } from '@skills-base/shared';

@Injectable()
export class UsersService {
  constructor(private readonly logger: Logger) {
    // Logger will automatically use the class name as the job name
  }
}

// 2. Explicit job name via constructor injection
@Injectable()
export class AuthService {
  constructor(
    @Inject(Logger)
    private readonly logger: Logger,
  ) {
    // Create a new logger instance with a specific job name
    this.logger = new Logger('auth-service');
  }
}

// 3. Direct instantiation (for non-injectable contexts)
class UserRepository {
  private logger = new Logger('user-repository');

  async findUser(id: string) {
    this.logger.info('Finding user by id', { userId: id });
    // ... implementation
  }
}

// 4. Utility functions or static contexts
function processPayment(paymentData: any) {
  const logger = new Logger('payment-processor');
  logger.info('Processing payment', { paymentId: paymentData.id });
  // ... implementation
}
```

### 3. Basic Logger Usage

```typescript
// users.service.ts
import { Injectable } from '@nestjs/common';
import { Logger } from '@skills-base/shared';

@Injectable()
export class UsersService {
  constructor(private readonly logger: Logger) {
    // Optionally create a new logger with a specific job name
    this.logger = new Logger('users-service');
  }

  async createUser(userData: any) {
    try {
      this.logger.info('Creating new user', { userId: userData.id });
      // ... user creation logic
    } catch (error) {
      this.logger.error('Failed to create user', { error });
      throw error;
    }
  }

  async updateUser(userId: string, updates: any) {
    // Create a sub-logger for a specific operation if needed
    const operationLogger = new Logger('user-updater');

    try {
      operationLogger.info('Updating user', { userId });
      // ... update logic
    } catch (error) {
      operationLogger.error('Update failed', { userId, error });
      throw error;
    }
  }
}

// Example in a non-service context
class BackgroundJob {
  private logger = new Logger('background-job');

  async process() {
    // For a specific task, you can create a task-specific logger
    const taskLogger = new Logger('data-sync');

    try {
      this.logger.info('Starting background job');
      taskLogger.info('Beginning data synchronization');
      // ... job logic
    } catch (error) {
      taskLogger.error('Sync failed', { error });
      this.logger.error('Background job failed', { error });
    }
  }
}
```

## Advanced Usage

### 1. Comprehensive Module Setup

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { LoggingModule } from '@skills-base/shared';

@Module({
  imports: [
    LoggingModule.forRoot({
      serviceName: 'user-management-service',
      environment: process.env.NODE_ENV,
      config: {
        logger: {
          level: 'debug',
          format: 'json',
          outputs: ['console', 'file', 'loki'],
          sensitiveKeys: ['password', 'token', 'apiKey'],
          file: {
            path: '/var/log/my-app',
            namePattern: 'app-%DATE%.log',
            rotatePattern: 'YYYY-MM-DD-HH',
            compress: true,
            retention: {
              enabled: true,
              days: 30,
              checkInterval: 24 * 60 * 60 * 1000, // 24 hours
            },
          },
        },
        errorTracker: {
          sampleRate: 1,
          contextLines: 5,
          maxStackFrames: 50,
        },
      },
      enableRequestLogging: true,
      enableGlobalInterceptor: true,
      skipPaths: ['/health', '/metrics', '/prometheus'],
    }),
  ],
})
export class AppModule {}
```

### 2. Advanced Logger Usage

```typescript
// users.service.ts
import { Injectable } from '@nestjs/common';
import { Logger } from '@skills-base/shared';

@Injectable()
export class UsersService {
  constructor(private readonly logger: Logger) {}

  async processUserRegistration(userData: any, context: any) {
    const correlationId = context.correlationId;

    try {
      this.logger.info('Starting user registration process', {
        correlationId,
        userId: userData.id,
        userType: userData.type,
        metadata: {
          source: userData.source,
          referral: userData.referralCode,
        },
      });

      // Process registration
      const startTime = Date.now();
      const result = await this.registerUser(userData);
      const duration = Date.now() - startTime;

      this.logger.info('User registration completed successfully', {
        correlationId,
        userId: result.id,
        duration,
        metadata: {
          verificationStatus: result.verified,
          accountType: result.type,
        },
      });

      return result;
    } catch (error) {
      await this.logger.trackException(error, {
        correlationId,
        userId: userData.id,
        tags: {
          operation: 'user_registration',
          userType: userData.type,
        },
        extra: {
          registrationSource: userData.source,
          attemptTimestamp: new Date().toISOString(),
        },
      });

      throw error;
    }
  }

  async auditUserActivity(userId: string, action: string) {
    this.logger.info('User activity logged', {
      type: 'audit',
      userId,
      action,
      timestamp: new Date().toISOString(),
      metadata: {
        ip: this.getCurrentIp(),
        userAgent: this.getCurrentUserAgent(),
      },
    });
  }
}
```

## Configuration Options

### Environment-Specific Configs

```typescript
LoggingModule.forRoot({
  serviceName: 'my-service',
  environmentConfigs: {
    development: {
      logger: {
        level: 'debug',
        format: 'text',
        outputs: ['console'],
      },
    },
    production: {
      logger: {
        level: 'info',
        format: 'json',
        outputs: ['console', 'file', 'loki'],
      },
    },
  },
});
```

### Async Configuration

```typescript
LoggingModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    serviceName: configService.get('SERVICE_NAME'),
    environment: configService.get('NODE_ENV'),
    config: {
      logger: {
        level: configService.get('LOG_LEVEL'),
        outputs: configService.get('LOG_OUTPUTS').split(','),
      },
    },
  }),
});
```

## Best Practices

1. **Consistent Context**: Always include correlationId when available

   ```typescript
   this.logger.info('Operation started', { correlationId, userId });
   ```

2. **Structured Logging**: Use metadata objects for better searchability

   ```typescript
   this.logger.info('Payment processed', {
     type: 'payment_processing',
     metadata: {
       amount: payment.amount,
       currency: payment.currency,
       status: payment.status,
     },
   });
   ```

3. **Error Tracking**: Use trackException for comprehensive error tracking

   ```typescript
   try {
     // operation
   } catch (error) {
     await this.logger.trackException(error, {
       correlationId,
       tags: { operation: 'payment_processing' },
     });
   }
   ```

4. **Security**: Never log sensitive data

   ```typescript
   // Configure sensitive keys
   LoggingModule.forRoot({
     config: {
       logger: {
         sensitiveKeys: ['password', 'token', 'creditCard'],
       },
     },
   });
   ```

5. **Performance Monitoring**: Log durations for important operations
   ```typescript
   const startTime = Date.now();
   // operation
   const duration = Date.now() - startTime;
   this.logger.info('Operation completed', { duration });
   ```

## Examples

### HTTP Controller Example

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly logger: Logger) {}

  @Post()
  async createUser(@Body() userData: CreateUserDto, @Req() request: Request) {
    const correlationId = request.headers['x-correlation-id'];

    this.logger.info('Received user creation request', {
      correlationId,
      metadata: {
        userType: userData.type,
        source: request.headers['user-agent'],
      },
    });

    try {
      const result = await this.usersService.createUser(userData);

      this.logger.info('User created successfully', {
        correlationId,
        userId: result.id,
        metadata: {
          userType: result.type,
          verificationStatus: result.verified,
        },
      });

      return result;
    } catch (error) {
      await this.logger.trackException(error, {
        correlationId,
        tags: {
          endpoint: 'create_user',
          userType: userData.type,
        },
      });
      throw error;
    }
  }
}
```

### Background Job Example

```typescript
@Injectable()
export class DataSyncJob {
  constructor(private readonly logger: Logger) {}

  @Cron('0 0 * * *')
  async syncData() {
    const jobId = uuidv4();
    const startTime = Date.now();

    this.logger.info('Starting daily data sync', {
      correlationId: jobId,
      type: 'background_job',
      metadata: {
        jobType: 'data_sync',
        scheduledTime: new Date().toISOString(),
      },
    });

    try {
      const result = await this.performSync();
      const duration = Date.now() - startTime;

      this.logger.info('Data sync completed', {
        correlationId: jobId,
        type: 'background_job',
        duration,
        metadata: {
          recordsProcessed: result.count,
          syncStatus: result.status,
          nextScheduledRun: result.nextRun,
        },
      });
    } catch (error) {
      await this.logger.trackException(error, {
        correlationId: jobId,
        tags: {
          jobType: 'data_sync',
          frequency: 'daily',
        },
        extra: {
          lastSuccessfulRun: this.getLastSuccessfulRun(),
          failureCount: this.getFailureCount(),
        },
      });
    }
  }
}
```
