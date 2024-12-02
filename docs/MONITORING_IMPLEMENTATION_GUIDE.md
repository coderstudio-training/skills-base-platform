# Monitoring Implementation Guide

This guide explains how to implement comprehensive monitoring in your NestJS microservice using the shared monitoring system.

## Prerequisites

1. Your service must have `@skills-base/shared` as a dependency:

```json
{
  "dependencies": {
    "@skills-base/shared": "^1.0.0"
  }
}
```

2. Optional Environment Variables:

```env
METRICS_ENABLED=true
METRICS_SAMPLE_RATE=1
HTTP_METRICS_ENABLED=true
SYSTEM_METRICS_ENABLED=true
BUSINESS_METRICS_ENABLED=true
METRICS_COLLECT_INTERVAL=10000
```

## Step 1: Configure Monitoring Module

### Root Module Configuration

```typescript
import { Module } from '@nestjs/common';
import { MonitoringModule } from '@skills-base/shared';

@Module({
  imports: [
    MonitoringModule.forRoot({
      serviceName: 'your-service-name',
      enabled: true,
      sampleRate: 1,
      metrics: {
        http: {
          enabled: true,
          buckets: [0.1, 0.3, 0.5, 1, 2, 5], // Response time buckets
          excludePaths: ['/health', '/metrics'],
        },
        system: {
          enabled: true,
          collectInterval: 10000, // 10 seconds
        },
        business: {
          enabled: true,
        },
      },
      tags: {
        environment: process.env.NODE_ENV,
        version: process.env.APP_VERSION,
      },
    }),
  ],
})
export class AppModule {}
```

### Feature Module Configuration (optional)

```typescript
@Module({
  imports: [
    MonitoringModule.forFeature({
      metrics: {
        business: {
          enabled: true,
        },
      },
    }),
  ],
})
export class FeatureModule {}
```

## Step 2: Types of Metrics

### 1. HTTP Metrics

Track HTTP request performance and counts:

```typescript
import { ApplicationMetricsService } from '@skills-base/shared';

@Controller('users')
export class UsersController {
  constructor(private readonly metricsService: ApplicationMetricsService) {}

  @Get()
  async findAll() {
    const startTime = Date.now();

    try {
      const users = await this.userService.findAll();

      // Track successful request
      this.metricsService.trackHttpRequest('GET', '/users', 200, (Date.now() - startTime) / 1000);

      return users;
    } catch (error) {
      // Track failed request
      this.metricsService.trackHttpRequest(
        'GET',
        '/users',
        error.status || 500,
        (Date.now() - startTime) / 1000,
      );
      throw error;
    }
  }
}
```

### 2. System Metrics

Monitor system resources:

```typescript
import { SystemMetricsService } from '@skills-base/shared';

@Injectable()
export class ResourceMonitor {
  constructor(private readonly systemMetrics: SystemMetricsService) {
    // System metrics are collected automatically
    // You can access them via the /metrics endpoint
  }

  // Custom system metric
  async monitorDiskSpace() {
    const usage = await this.checkDiskUsage();
    this.systemMetrics
      .createMetric('gauge', 'disk_usage_percent', 'Disk usage percentage')
      .set({ path: '/var/data' }, usage);
  }
}
```

### 3. Business Metrics

Track domain-specific metrics:

```typescript
import { ApplicationMetricsService } from '@skills-base/shared';

@Injectable()
export class PaymentService {
  constructor(private readonly metricsService: ApplicationMetricsService) {}

  async processPayment(payment: Payment) {
    try {
      await this.processTransaction(payment);

      // Track successful payment
      this.metricsService.trackBusinessEvent('payment_processed', 'success');

      // Track payment amount
      this.metricsService
        .createMetric('histogram', 'payment_amount_dollars', 'Payment amounts in dollars')
        .observe(
          {
            type: payment.type,
            currency: payment.currency,
          },
          payment.amount,
        );
    } catch (error) {
      this.metricsService.trackBusinessEvent('payment_processed', 'error');
      throw error;
    }
  }
}
```

## Step 3: Metric Types

### 1. Counters

For values that only increase:

```typescript
@Injectable()
export class UserService {
  private readonly registrationCounter: Counter;

  constructor(private readonly metricsService: ApplicationMetricsService) {
    this.registrationCounter = this.metricsService.createMetric(
      'counter',
      'user_registrations_total',
      'Total number of user registrations',
      ['status', 'source'],
    );
  }

  async register(user: NewUser) {
    try {
      await this.createUser(user);
      this.registrationCounter.inc({
        status: 'success',
        source: user.source,
      });
    } catch (error) {
      this.registrationCounter.inc({
        status: 'error',
        source: user.source,
      });
      throw error;
    }
  }
}
```

### 2. Gauges

For values that can go up and down:

```typescript
@Injectable()
export class ConnectionPool {
  private readonly activeConnections: Gauge;

  constructor(private readonly metricsService: ApplicationMetricsService) {
    this.activeConnections = this.metricsService.createMetric(
      'gauge',
      'active_connections',
      'Number of active connections',
      ['pool_type'],
    );
  }

  connect() {
    this.activeConnections.inc({ pool_type: 'main' });
  }

  disconnect() {
    this.activeConnections.dec({ pool_type: 'main' });
  }

  setConnections(count: number) {
    this.activeConnections.set({ pool_type: 'main' }, count);
  }
}
```

### 3. Histograms

For measuring distributions:

```typescript
@Injectable()
export class QueryService {
  private readonly queryDuration: Histogram;

  constructor(private readonly metricsService: ApplicationMetricsService) {
    this.queryDuration = this.metricsService.createMetric(
      'histogram',
      'query_duration_seconds',
      'Duration of database queries',
      ['query_type'],
      { buckets: [0.1, 0.5, 1, 2, 5] },
    );
  }

  async executeQuery(query: string) {
    const end = this.queryDuration.startTimer();
    try {
      const result = await this.runQuery(query);
      end({ query_type: this.getQueryType(query) });
      return result;
    } catch (error) {
      end({ query_type: 'error' });
      throw error;
    }
  }
}
```

## Step 4: Automated Request Tracking

### 1. Using the MetricsInterceptor

```typescript
import { TrackMetric } from '@skills-base/shared';

@Controller('products')
export class ProductsController {
  @TrackMetric({
    name: 'product_search',
    eventType: 'product.search',
    labels: { source: 'api' },
  })
  @Get('search')
  async search(@Query() query: SearchDto) {
    // The request will be automatically tracked
    // @TrackMetric will track a seperate metric specified. You do not need to @TrackMetric all your APIs
    return this.productService.search(query);
  }
}
```

### 2. Custom Interceptor Configuration

```typescript
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useFactory: (metricsService: ApplicationMetricsService) => {
        return new MetricsInterceptor(metricsService, {
          excludePaths: ['/health'],
          defaultLabels: {
            service: 'product-service',
          },
        });
      },
      inject: [ApplicationMetricsService],
    },
  ],
})
export class AppModule {}
```

## Best Practices

### 1. Naming Conventions

Follow consistent metric naming:

```typescript
// Good - clear, consistent names
const metrics = {
  counter: 'http_requests_total',
  histogram: 'http_request_duration_seconds',
  gauge: 'active_connections_current',
};

// Bad - inconsistent naming
const badMetrics = {
  counter: 'requests',
  histogram: 'latency_ms',
  gauge: 'connections',
};
```

### 2. Label Usage

Use labels effectively but sparingly:

```typescript
// Good - relevant, bounded labels
this.metricsService.trackHttpRequest(method, path, status, duration, {
  route: '/api/v1/users/:id',
  status_code: status.toString(),
});

// Bad - too many label combinations
this.metricsService.trackHttpRequest(method, path, status, duration, {
  user_id: userId, // High cardinality!
  timestamp: new Date(), // High cardinality!
  request_id: requestId, // High cardinality!
});
```

## Performance Considerations

### 1. Sample Rate Configuration

Control metric collection overhead:

```typescript
MonitoringModule.forRoot({
  serviceName: 'your-service',
  sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1, // 10% sampling in prod
  metrics: {
    http: {
      enabled: true,
      // Only sample slow requests at higher rate
      sampleRateByDuration: {
        '0.1': 0.1, // Sample 10% of requests under 100ms
        '1': 0.5, // Sample 50% of requests under 1s
        inf: 1, // Sample all requests over 1s
      },
    },
  },
});
```

### 2. Metric Cardinality Management

Control label combinations:

```typescript
@Injectable()
export class MetricService {
  constructor(private readonly metricsService: ApplicationMetricsService) {}

  // Good - Bounded label values
  trackApiError(error: Error) {
    this.metricsService
      .createMetric('counter', 'api_errors_total', 'Total API errors', ['error_type', 'status'])
      .inc({
        error_type: this.normalizeErrorType(error),
        status: this.normalizeStatus(error.status),
      });
  }

  private normalizeErrorType(error: Error): string {
    // Limit to known error types
    const knownTypes = ['validation', 'auth', 'business', 'system'];
    const type = error.constructor.name
      .toLowerCase()
      .replace('error', '')
      .replace(/[^a-z]/g, '');
    return knownTypes.includes(type) ? type : 'other';
  }

  private normalizeStatus(status: number): string {
    // Group status codes
    if (status >= 500) return '5xx';
    if (status >= 400) return '4xx';
    return 'other';
  }
}
```

### 3. Batch Operations

Handle high-volume operations efficiently:

```typescript
@Injectable()
export class BatchProcessor {
  private batchMetrics: {
    processed: number;
    errors: number;
    duration: number[];
  } = {
    processed: 0,
    errors: 0,
    duration: [],
  };

  constructor(private readonly metricsService: ApplicationMetricsService) {
    // Flush metrics every 5 seconds
    setInterval(() => this.flushMetrics(), 5000);
  }

  async processItem(item: any) {
    const start = process.hrtime();

    try {
      await this.process(item);
      this.batchMetrics.processed++;
    } catch (error) {
      this.batchMetrics.errors++;
    }

    const [s, ns] = process.hrtime(start);
    this.batchMetrics.duration.push(s + ns / 1e9);
  }

  private flushMetrics() {
    if (this.batchMetrics.processed === 0 && this.batchMetrics.errors === 0) {
      return;
    }

    // Record batch metrics
    const metrics = this.metricsService;

    metrics
      .createMetric('counter', 'batch_items_processed_total', 'Total number of processed items')
      .inc(this.batchMetrics.processed);

    metrics
      .createMetric('counter', 'batch_errors_total', 'Total number of batch errors')
      .inc(this.batchMetrics.errors);

    // Record duration histogram
    const histogram = metrics.createMetric(
      'histogram',
      'batch_item_duration_seconds',
      'Processing duration per item',
    );

    this.batchMetrics.duration.forEach(d => histogram.observe({}, d));

    // Reset batch metrics
    this.batchMetrics = {
      processed: 0,
      errors: 0,
      duration: [],
    };
  }
}
```

## Advanced Metrics Types

### 1. SLA/SLO Tracking

Track service level objectives:

```typescript
@Injectable()
export class SLOTracker {
  private readonly sloMetrics: {
    latencyHistogram: Histogram;
    availabilityGauge: Gauge;
  };

  constructor(private readonly metricsService: ApplicationMetricsService) {
    this.sloMetrics = {
      latencyHistogram: this.metricsService.createMetric(
        'histogram',
        'slo_latency_seconds',
        'Request latency for SLO tracking',
        ['endpoint'],
        {
          buckets: [0.1, 0.2, 0.5, 1], // SLO thresholds
        },
      ),
      availabilityGauge: this.metricsService.createMetric(
        'gauge',
        'slo_availability_ratio',
        'Service availability ratio',
        ['window'], // 1h, 24h, 30d
      ),
    };
  }

  trackRequest(endpoint: string, duration: number, success: boolean) {
    // Track latency
    this.sloMetrics.latencyHistogram.observe({ endpoint }, duration);

    // Update availability windows
    if (success) {
      this.updateAvailabilityWindow('1h', 1);
      this.updateAvailabilityWindow('24h', 1);
    } else {
      this.updateAvailabilityWindow('1h', 0);
      this.updateAvailabilityWindow('24h', 0);
    }
  }

  private updateAvailabilityWindow(window: string, value: number) {
    this.sloMetrics.availabilityGauge.set({ window }, value);
  }
}
```

### 2. Resource Usage Tracking

Monitor application resources:

```typescript
@Injectable()
export class ResourceMonitor {
  constructor(private readonly systemMetrics: SystemMetricsService) {
    this.initializeResourceMetrics();
  }

  private initializeResourceMetrics() {
    // Memory metrics
    const memoryGauge = this.systemMetrics.createMetric(
      'gauge',
      'memory_usage_bytes',
      'Memory usage in bytes',
      ['type'],
    );

    // CPU metrics
    const cpuGauge = this.systemMetrics.createMetric(
      'gauge',
      'cpu_usage_percent',
      'CPU usage percentage',
      ['core'],
    );

    // Collection interval
    setInterval(() => {
      // Memory metrics
      const memory = process.memoryUsage();
      Object.entries(memory).forEach(([type, value]) => {
        memoryGauge.set({ type }, value);
      });

      // CPU metrics
      const cpuUsage = process.cpuUsage();
      cpuGauge.set({ core: 'user' }, cpuUsage.user / 1000000);
      cpuGauge.set({ core: 'system' }, cpuUsage.system / 1000000);
    }, 5000);
  }
}
```

### 3. Custom Business Metrics

Track domain-specific metrics:

```typescript
@Injectable()
export class BusinessMetricsService {
  private readonly metrics: {
    activeSubscriptions: Gauge;
    revenueCounter: Counter;
    userActivityHistogram: Histogram;
  };

  constructor(private readonly metricsService: ApplicationMetricsService) {
    this.metrics = {
      activeSubscriptions: this.metricsService.createMetric(
        'gauge',
        'active_subscriptions',
        'Currently active subscriptions',
        ['plan', 'status'],
      ),

      revenueCounter: this.metricsService.createMetric(
        'counter',
        'revenue_cents_total',
        'Total revenue in cents',
        ['plan', 'currency'],
      ),

      userActivityHistogram: this.metricsService.createMetric(
        'histogram',
        'user_session_duration_minutes',
        'User session duration in minutes',
        ['user_type'],
        { buckets: [5, 15, 30, 60, 120] },
      ),
    };
  }

  trackSubscriptionChange(plan: string, status: string, count: number) {
    this.metrics.activeSubscriptions.set({ plan, status }, count);
  }

  trackRevenue(plan: string, currency: string, amountCents: number) {
    this.metrics.revenueCounter.inc({ plan, currency }, amountCents);
  }

  trackUserSession(userType: string, durationMinutes: number) {
    this.metrics.userActivityHistogram.observe({ user_type: userType }, durationMinutes);
  }
}
```
