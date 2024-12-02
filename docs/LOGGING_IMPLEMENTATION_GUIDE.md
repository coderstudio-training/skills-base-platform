# Logging Implementation Guide

This guide explains how to implement structured logging in your NestJS microservice using the shared logging system.

## Prerequisites

1. Your service must have `@skills-base/shared` as a dependency in package.json:

```json
{
  "dependencies": {
    "@skills-base/shared": "^1.0.0"
  }
}
```

2. Environment Variables (Optional):

```env
LOG_LEVEL=info           # error, warn, info, debug
LOG_FORMAT=text          # text or json
LOG_PATH=/var/log/app    # Log file location
```

## Step 1: Configure Logging Module

### Root Module Configuration

In your `app.module.ts`, configure the logging module:

```typescript
import { Module } from '@nestjs/common';
import { LoggingModule } from '@skills-base/shared';

@Module({
  imports: [
    LoggingModule.forRoot({
      serviceName: 'your-service-name',
      environment: process.env.NODE_ENV,
      enableGlobalInterceptor: true, // Automatic HTTP request logging
      skipPaths: ['/health', '/metrics'], // Paths to exclude from logging
    }),
  ],
})
export class AppModule {}
```

### Feature Module Configuration

For feature-specific logging configuration:

```typescript
@Module({
  imports: [
    LoggingModule.forFeature({
      serviceName: 'feature-name',
    }),
  ],
})
export class FeatureModule {}
```

## Step 2: Using the Logger

### Basic Logger Usage

```typescript
import { Injectable } from '@nestjs/common';
import { Logger } from '@skills-base/shared';

@Injectable()
export class YourService {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger('YourService');
  }

  async doSomething() {
    // Info level - general application flow
    this.logger.info('Processing request', {
      type: 'request.process',
      userId: 'user123',
    });

    // Debug level - detailed information
    this.logger.debug('Detailed operation info', {
      metadata: { key: 'value' },
    });

    // Warning level - issues that need attention
    this.logger.warn('Resource running low', {
      type: 'resource.warning',
      metadata: { usage: 85 },
    });

    // Error level - problems that need immediate attention
    try {
      // Operation that might fail
    } catch (error) {
      this.logger.error(error, {
        type: 'operation.failed',
        metadata: { attempt: 1 },
      });
    }
  }
}
```

### Log Levels

Use appropriate log levels based on the information:

1. **ERROR** - For errors that need immediate attention

   ```typescript
   logger.error(error, {
     type: 'critical.failure',
     metadata: { operation: 'payment' },
   });
   ```

2. **WARN** - For warning conditions

   ```typescript
   logger.warn('High API latency detected', {
     type: 'performance.warning',
     latency: 500,
   });
   ```

3. **INFO** - For normal but significant events

   ```typescript
   logger.info('User logged in', {
     type: 'auth.login',
     userId: 'user123',
   });
   ```

4. **DEBUG** - For detailed debugging information
   ```typescript
   logger.debug('Cache hit', {
     type: 'cache.status',
     key: 'user:123',
     value: 'cached-data',
   });
   ```

## Step 3: Structured Logging Context

### Standard Context Fields

Always include relevant context in your logs:

```typescript
{
  type: 'event.category',          // Event classification
  correlationId: 'req-123',        // Request tracking ID
  userId: 'user123',               // User identifier
  metadata: {                      // Additional context
    operation: 'create',
    duration: 123,
    status: 'success'
  }
}
```

### Sensitive Data Handling

The logger automatically masks sensitive data in fields like:

- password
- token
- apiKey
- secret
- authorization

Add custom sensitive fields in your configuration:

```typescript
LoggingModule.forRoot({
  serviceName: 'your-service',
  logger: {
    sensitiveKeys: ['creditCard', 'ssn'],
  },
});
```

## Error Handling Best Practices

### 1. Error Objects

Always pass Error objects to error logging:

```typescript
try {
  await riskyOperation();
} catch (error) {
  this.logger.error(error, {
    type: 'operation.failed',
    metadata: { operationId: '123' },
  });
  throw error; // Re-throw if needed
}
```

### 2. Error Context

Include relevant context with errors:

```typescript
try {
  await saveUser(userData);
} catch (error) {
  this.logger.error(error, {
    type: 'user.create.failed',
    metadata: {
      userId: userData.id,
      attempt: retryCount,
      errorCode: error.code,
    },
  });
}
```

## Log Output Configuration

### Development Environment

```typescript
LoggingModule.forRoot({
  serviceName: 'your-service',
  environment: 'development',
  logger: {
    level: LogLevel.DEBUG,
    format: 'text',
    outputs: ['console', 'file'],
  },
});
```

### Production Environment

```typescript
LoggingModule.forRoot({
  serviceName: 'your-service',
  environment: 'production',
  logger: {
    level: LogLevel.INFO,
    format: 'json',
    outputs: ['file', 'loki'],
    file: {
      path: '/var/log/app',
      retention: {
        days: 30,
        enabled: true,
      },
    },
  },
});
```

## Testing with Logs

### Mocking the Logger

```typescript
import { Logger } from '@skills-base/shared';

describe('YourService', () => {
  let service: YourService;
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger('test');
    jest.spyOn(logger, 'info');
    jest.spyOn(logger, 'error');
  });

  it('should log operations', () => {
    service.doSomething();
    expect(logger.info).toHaveBeenCalledWith('Operation started', expect.any(Object));
  });
});
```

## Best Practices

### 1. Consistent Event Types

Use a consistent naming pattern for event types:

```typescript
// Good - hierarchical and clear
{
  type: 'user.login.success';
  type: 'user.login.failed';
  type: 'order.create.started';
  type: 'order.create.completed';
}

// Bad - inconsistent and vague
{
  type: 'userLogin';
  type: 'failed_login';
  type: 'starting-order';
  type: 'orderDone';
}
```

### 2. Correlation Tracking

Track related operations using correlation IDs:

```typescript
@Injectable()
export class OrderService {
  private readonly logger: Logger;

  async processOrder(orderId: string, correlationId: string) {
    this.logger.info('Starting order processing', {
      type: 'order.process.start',
      correlationId,
      metadata: { orderId },
    });

    try {
      await this.validateOrder(orderId, correlationId);
      await this.processPayment(orderId, correlationId);
      await this.updateInventory(orderId, correlationId);

      this.logger.info('Order processing completed', {
        type: 'order.process.complete',
        correlationId,
        metadata: { orderId },
      });
    } catch (error) {
      this.logger.error(error, {
        type: 'order.process.failed',
        correlationId,
        metadata: { orderId },
      });
      throw error;
    }
  }

  private async validateOrder(orderId: string, correlationId: string) {
    this.logger.debug('Validating order', {
      type: 'order.validate',
      correlationId,
      metadata: { orderId },
    });
    // Validation logic
  }
}
```

### 3. Performance Logging

Track operation durations:

```typescript
@Injectable()
export class PerformanceAwareService {
  private readonly logger: Logger;

  async performOperation() {
    const startTime = Date.now();

    try {
      await this.operation();
    } finally {
      const duration = Date.now() - startTime;
      this.logger.info('Operation completed', {
        type: 'operation.complete',
        metadata: {
          duration,
          performanceCategory: this.categorizeDuration(duration),
        },
      });
    }
  }

  private categorizeDuration(duration: number): string {
    if (duration < 100) return 'fast';
    if (duration < 1000) return 'normal';
    return 'slow';
  }
}
```

### 4. Batch Operation Logging

For batch operations, log progress appropriately:

```typescript
@Injectable()
export class BatchProcessor {
  private readonly logger: Logger;

  async processBatch(items: any[]) {
    this.logger.info('Starting batch process', {
      type: 'batch.start',
      metadata: {
        totalItems: items.length,
      },
    });

    let processed = 0;
    let failed = 0;

    for (const item of items) {
      try {
        await this.processItem(item);
        processed++;

        if (processed % 100 === 0) {
          // Log progress periodically
          this.logger.debug('Batch progress', {
            type: 'batch.progress',
            metadata: {
              processed,
              failed,
              remaining: items.length - processed,
              percentComplete: (processed / items.length) * 100,
            },
          });
        }
      } catch (error) {
        failed++;
        this.logger.error(error, {
          type: 'batch.item.failed',
          metadata: {
            itemId: item.id,
            processed,
            failed,
          },
        });
      }
    }

    this.logger.info('Batch processing completed', {
      type: 'batch.complete',
      metadata: {
        totalProcessed: processed,
        totalFailed: failed,
        successRate: ((processed - failed) / processed) * 100,
      },
    });
  }
}
```

## Advanced Configuration

### 1. Custom Log Transports

Configure multiple log outputs:

```typescript
LoggingModule.forRoot({
  serviceName: 'your-service',
  logger: {
    outputs: ['console', 'file', 'loki'],
    file: {
      path: '/var/log/app',
      namePattern: '%DATE%.log',
      rotatePattern: 'YYYY-MM-DD-HH',
      compress: true,
      retention: {
        enabled: true,
        days: 30,
        checkInterval: 24 * 60 * 60 * 1000, // 24 hours
      },
    },
  },
});
```

### 2. Log Rotation Configuration

Configure log rotation for production:

```typescript
LoggingModule.forRoot({
  serviceName: 'your-service',
  logger: {
    file: {
      maxSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      compress: true,
      retention: {
        enabled: true,
        days: 30,
      },
    },
  },
});
```

### 3. Environment-Specific Configuration

```typescript
const getLogConfig = (env: string) => {
  switch (env) {
    case 'production':
      return {
        level: LogLevel.INFO,
        format: 'json',
        outputs: ['file', 'loki'],
      };
    case 'staging':
      return {
        level: LogLevel.DEBUG,
        format: 'json',
        outputs: ['file', 'console'],
      };
    default:
      return {
        level: LogLevel.DEBUG,
        format: 'text',
        outputs: ['console'],
      };
  }
};

LoggingModule.forRoot({
  serviceName: 'your-service',
  environment: process.env.NODE_ENV,
  logger: getLogConfig(process.env.NODE_ENV),
});
```

## Log Analysis

### 1. Log Querying

When using Loki, you can query logs using LogQL:

```sql
{service="your-service"}
  | json
  | type="order.process.failed"
  | duration > 1000
```

### 2. Metrics from Logs

Extract metrics from logs for monitoring:

```typescript
@Injectable()
export class MetricsLogger {
  private readonly logger: Logger;

  logOperationMetrics(operation: string, duration: number, success: boolean) {
    this.logger.info('Operation metrics', {
      type: 'metrics.operation',
      metadata: {
        operation,
        duration,
        success,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
```

## Security Considerations

### 1. PII Handling

Never log Personal Identifiable Information (PII):

```typescript
// Good - Log reference without PII
this.logger.info('User profile updated', {
  type: 'user.profile.update',
  userId: 'user123',
  metadata: {
    fieldsUpdated: ['address', 'phone'],
  },
});

// Bad - Contains PII
this.logger.info('User profile updated', {
  type: 'user.profile.update',
  email: 'user@example.com',
  address: '123 Main St',
});
```

### 2. Sensitive Data

Use the built-in masking for sensitive data:

```typescript
// Automatic masking of sensitive fields
this.logger.info('API request', {
  headers: {
    authorization: 'Bearer token123', // Will be masked
    apiKey: 'secret123', // Will be masked
  },
});
```

### 3. Error Stack Traces

Be cautious with error stack traces in production:

```typescript
if (process.env.NODE_ENV === 'production') {
  // Log without stack trace
  this.logger.error(new Error('Operation failed'), {
    type: 'error.production',
    metadata: {
      code: error.code,
      message: error.message,
    },
  });
} else {
  // Include stack trace in development
  this.logger.error(error);
}
```

## Monitoring and Alerts

### 1. Error Rate Monitoring

Monitor error rates using log patterns:

```typescript
// Log pattern for monitoring
this.logger.error(error, {
  type: 'critical.error',
  alert: true, // Flag for alerting systems
  metadata: {
    severity: 'high',
    component: 'payment-processor',
  },
});
```

### 2. Performance Monitoring

Track performance metrics:

```typescript
this.logger.info('Performance metric', {
  type: 'metrics.performance',
  metadata: {
    operation: 'database.query',
    duration: 150,
    threshold: 100,
    exceeded: true,
  },
});
```

These logging patterns and configurations will help you maintain a robust and maintainable logging system across your microservices architecture.
