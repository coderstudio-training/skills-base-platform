# Logging & Monitoring Implementation Guide & Example

# DISCLAIMER: THIS IS A WORK IN PROGRESS, MAY CAUSE ERRORS

1. First, import and configure the LoggingModule in your main application module (app.module.ts):

```typescript
import { Module } from '@nestjs/common';
import { LoggingModule } from '@skills-base/shared';

@Module({
  imports: [
    LoggingModule.forRoot({
      serviceName: 'user-service', // Name of your microservice
      environment: process.env.NODE_ENV || 'development',
    }),
    // Other modules...
  ],
})
export class AppModule {}
```

2. In your feature modules, you can use LoggingModule.forFeature():

```typescript
import { Module } from '@nestjs/common';
import { LoggingModule } from '@skills-base/shared';

@Module({
  imports: [
    LoggingModule.forFeature({
      serviceName: 'user-management',
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
```

3. In your services and controllers, inject and use the Logger and Monitor:

```typescript
import { Injectable } from '@nestjs/common';
import { Logger, Monitor } from '@skills-base/shared';

@Injectable()
export class UserService {
  constructor(
    private readonly logger: Logger,
    private readonly monitor: Monitor,
  ) {}

  async createUser(userData: any) {
    try {
      // Start timing the operation
      const timer = this.monitor.startTimer('user.create');

      this.logger.info('Creating new user', {
        type: 'user.create',
        userData: userData.email, // Log non-sensitive data
      });

      // Your user creation logic here
      const result = await this.userRepository.create(userData);

      // Track the operation duration
      timer.end();

      // Log success
      this.logger.info('User created successfully', {
        type: 'user.create.success',
        userId: result.id,
      });

      return result;
    } catch (error) {
      // Track and log error
      await this.logger.trackException(error, {
        type: 'user.create.error',
        userData: userData.email,
      });

      throw error;
    }
  }

  async findUsers(criteria: any) {
    const timer = this.monitor.startTimer('user.search');

    try {
      this.logger.debug('Searching users', {
        type: 'user.search',
        criteria,
      });

      const users = await this.userRepository.find(criteria);

      // Track metrics
      this.monitor.trackMetric('user.search.results', users.length, {
        criteria: JSON.stringify(criteria),
      });

      timer.end();
      return users;
    } catch (error) {
      await this.logger.trackException(error, {
        type: 'user.search.error',
        criteria,
      });
      throw error;
    }
  }
}
```

4. The LoggingInterceptor is automatically applied to all routes. However, you can add custom metrics endpoints:

```typescript
import { Controller, Get } from '@nestjs/common';
import { PrometheusAdapter } from '@skills-base/shared';
@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly prometheusAdapter: PrometheusAdapter) {}

  @Get('metrics')
  getMetrics() {
    return this.prometheusAdapter.generateMetrics();
  }
}
```

5. For database operations or external service calls, track dependencies:

```typescript
import { Injectable } from '@nestjs/common';
import { Logger, Monitor } from '@skills-base/shared';

@Injectable()
export class PaymentService {
  constructor(
    private readonly logger: Logger,
    private readonly monitor: Monitor,
  ) {}

  async processPayment(paymentData: any) {
    const startTime = Date.now();

    try {
      this.logger.info('Processing payment', {
        type: 'payment.process',
        paymentId: paymentData.id,
      });

      // Call external payment service
      const result = await this.paymentProvider.process(paymentData);

      // Track external dependency
      this.monitor.trackDependency('payment-provider', 'process-payment', Date.now() - startTime);

      return result;
    } catch (error) {
      await this.logger.trackException(error, {
        type: 'payment.process.error',
        paymentId: paymentData.id,
      });
      throw error;
    }
  }
}
```

6. Configure environment-specific settings in your .env file:

```env
LOG_LEVEL=info
LOG_FORMAT=json
LOG_OUTPUTS=console,file
MONITOR_ENABLED=true
MONITOR_SAMPLE_RATE=1
LOG_PATH=/var/log/microservices
```

The logging module will automatically:

- Log all HTTP requests and responses
- Track operation durations
- Monitor memory and CPU usage
- Generate Prometheus metrics
- Handle log rotation and file management
- Mask sensitive data
- Track errors with context
- Provide correlation IDs for request tracing

You can access your metrics at `/metrics` endpoint and view them in Prometheus/Grafana, and your logs will be in ELK-compatible format for easy integration with Elasticsearch/Kibana.
