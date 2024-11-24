# Setup Guide for Core Modules

## 1. Configure app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggingModule, MonitoringModule, SecurityModule } from '@skills-base/shared';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Configure Logging Module
    LoggingModule.forRoot({
      serviceName: 'my-service',
      environment: process.env.NODE_ENV,
      enableGlobalInterceptor: true,
      skipPaths: ['/health', '/metrics'], // Optional: paths to skip logging
    }),

    // Configure Security Module
    SecurityModule.forRoot({
      rateLimit: {
        enabled: true,
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
      },
      apiKey: {
        enabled: false, // Enable if you want API keying
        keys: [process.env.API_KEY], // Your API keys
      },
      ipWhitelist: {
        enabled: false, // Enable if you want IP whitelisting
        allowedIps: [],
      },
    }),

    // Configure Monitoring Module
    MonitoringModule.forRoot({
      serviceName: 'my-service',
      enabled: true,
      metrics: {
        http: {
          enabled: true,
          excludePaths: ['/health', '/metrics'],
        },
        system: {
          enabled: true,
          collectInterval: 10000, // 10 seconds
        },
      },
    }),
  ],
})
export class AppModule {}
```

## 2. Configure main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import {
  SwaggerHelper,
  HttpExceptionFilter,
  SecurityMiddleware,
  Logger,
} from '@skills-base/shared';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create NestJS application
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Initialize logger
  const logger = new Logger('Bootstrap');

  // Apply global middleware
  app.use(new SecurityMiddleware().use);

  // Apply global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Apply global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Setup Swagger documentation
  SwaggerHelper.setup(
    app,
    'My API Documentation',
    'swagger', // Access swagger at /swagger
  );

  // Start the application
  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.info(`Application is running on: http://localhost:${port}`);
}

bootstrap();
```

## 3. Environment Variables

Create a `.env` file in your project root:

```env
# Basic Configuration
NODE_ENV=development
PORT=3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/your-database

# Security Configuration
API_KEY=your-api-key-here
JWT_SECRET=your-jwt-secret-here

# Monitoring Configuration (Optional)
METRICS_ENABLED=true
METRICS_SAMPLE_RATE=1

# Logging Configuration (Optional)
LOG_LEVEL=info
LOG_FORMAT=json
```

## 4. Usage Examples

### Using the Logger

```typescript
import { Logger } from '@skills-base/shared';

@Injectable()
export class YourService {
  private readonly logger = new Logger(YourService.name);

  someMethod() {
    this.logger.info('This is an info message', {
      correlationId: 'some-id',
      additionalData: { key: 'value' },
    });
  }
}
```

### Protecting Routes with API Key

```typescript
import { RequireApiKey } from '@skills-base/shared';

@Controller('protected')
@RequireApiKey()
export class ProtectedController {
  // This route requires an API key
  @Get()
  getData() {
    return { message: 'Protected data' };
  }
}
```

### Adding Custom Metrics

```typescript
import { ApplicationMetricsService } from '@skills-base/shared';

@Injectable()
export class YourService {
  constructor(private readonly metrics: ApplicationMetricsService) {}

  trackBusinessEvent() {
    this.metrics.trackBusinessEvent('order_created', 'success');
  }
}
```

## 7. Verification

After setup, verify the installation by checking:

1. Swagger UI: http://localhost:3000/swagger
2. Metrics endpoint: http://localhost:3000/metrics
3. Check logs in the console or configured log file
4. Test rate limiting by making multiple rapid requests
5. Verify API key protection by accessing a protected endpoint

## 8. Troubleshooting

If you encounter issues:

1. Verify all required environment variables are set
2. Check MongoDB connection is active
3. Ensure ports are not in use
4. Check log files for detailed error messages
5. Verify API keys are properly configured
