# Shared Logging and Monitoring Package

A standardized logging and monitoring solution for our microservices architecture. This package provides consistent logging, error tracking, and performance monitoring across all services.

## Quick Start

```typescript
import { Logger, Monitor, LogLevel } from '@skills-base/shared';

// Create logger instance
const logger = new Logger('ServiceName', {
  level: LogLevel.INFO,
  format: 'json',
  outputs: ['console', 'file'],
  filename: 'logs/service.log',
});

// Create monitor instance
const monitor = new Monitor('ServiceName', {
  enabled: true,
  sampleRate: 1,
  metricsInterval: 60000,
});

// Use in your service
logger.info('Application started');
monitor.trackMetric('custom.metric', 100);
```

## Features

- Structured logging with multiple output targets
- Performance monitoring and metrics collection
- Request/Response tracking with correlation IDs
- Automatic log rotation and compression
- Sensitive data masking
- System metrics tracking (CPU, Memory)
- Database and external service call monitoring

## Integration

### 1. Module Setup

```typescript
// app.module.ts
import { Module, MiddlewareConsumer } from '@nestjs/common';
import { LoggingMiddleware } from '@skills-base/shared';

@Module({
  imports: [],
  providers: [
    {
      provide: 'LOGGER',
      useValue: new Logger('AppModule'),
    },
    {
      provide: 'MONITOR',
      useValue: new Monitor('AppModule'),
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
```

### 2. Service Usage

```typescript
// user.service.ts
import { Injectable } from '@nestjs/common';
import { Logger, Monitor } from '@your-org/shared-logging';

@Injectable()
export class UserService {
  constructor() {
    private readonly logger = new Logger('UserService');
    private readonly monitor = new Monitor('UserService');
  }

  async createUser(data: CreateUserDto) {
    const timer = this.monitor.startTimer('createUser');

    try {
      this.logger.info('Creating user', { data });
      // Your logic here

      const duration = timer.end();
      this.logger.info('User created', { duration });
    } catch (error) {
      this.logger.error('Failed to create user', { error });
      throw error;
    }
  }
}
```

## Configuration

### Logger Options

```typescript
{
  level: LogLevel.INFO,      // Minimum log level
  format: 'json',           // 'json' or 'text'
  outputs: ['console'],     // 'console' and/or 'file'
  filename: 'app.log',      // Log file path
  maxSize: 10485760,       // Max file size (10MB)
  maxFiles: 5,             // Number of rotated files to keep
  sensitiveKeys: ['password', 'token'] // Keys to mask
}
```

### Monitor Options

```typescript
{
  enabled: true,           // Enable/disable monitoring
  sampleRate: 1,          // Sampling rate (0-1)
  metricsInterval: 60000, // Metrics collection interval (ms)
  tags: {                 // Global tags
    environment: 'production'
  }
}
```

## Best Practices

1. **Log Levels**

   - ERROR: Application errors and exceptions
   - WARN: Warning conditions
   - INFO: General operational information
   - DEBUG: Detailed debugging information

2. **Context**

   ```typescript
   logger.info('Action performed', {
     userId: user.id,
     action: 'login',
     ip: request.ip,
   });
   ```

3. **Performance Monitoring**

   ```typescript
   const timer = monitor.startTimer('operation');
   // ... your code ...
   const duration = timer.end();
   ```

4. **Error Handling**
   ```typescript
   try {
     // Your code
   } catch (error) {
     logger.error('Operation failed', {
       error,
       context: 'additional context',
     });
     throw error;
   }
   ```

## Security Considerations

- Sensitive data is automatically masked based on configured keys
- Log files are automatically rotated to manage disk space
- Old log files are compressed to save storage
- Access to log files should be restricted at the OS level

## Environment Variables (Optional)

```env
LOG_LEVEL=info
LOG_FORMAT=json
LOG_OUTPUT=console,file
LOG_FILE_PATH=logs/service.log
METRICS_ENABLED=true
METRICS_INTERVAL=60000
```
