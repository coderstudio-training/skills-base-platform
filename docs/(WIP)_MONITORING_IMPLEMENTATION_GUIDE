# Monitoring Implementation Guide

The Monitoring Module provides application metrics tracking using Prometheus, with support for HTTP, system, and business metrics. This guide covers setting up and using the module in your NestJS application.

## Basic Setup

### Minimal Configuration

The minimal setup enables metrics collection with default settings:

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { MonitoringModule } from '@skills-base/shared';

@Module({
  imports: [
    MonitoringModule.forRoot({
      serviceName: 'my-service',
    }),
  ],
})
export class AppModule {}
```

This configuration:

- Enables all metrics collection
- Uses default sampling rate (1)
- Uses default HTTP buckets
- Collects system metrics every 10 seconds
- Exposes metrics at `/metrics` endpoint

### Full Configuration

For more control, you can customize every aspect of the monitoring:

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { MonitoringModule } from '@skills-base/shared';

@Module({
  imports: [
    MonitoringModule.forRoot({
      serviceName: 'my-service',
      enabled: true,
      sampleRate: 0.5, // Sample 50% of requests
      metrics: {
        http: {
          enabled: true,
          buckets: [0.1, 0.5, 1, 2, 5], // Custom histogram buckets
          excludePaths: ['/health', '/metrics', '/api/internal/*'], // Exclude paths
        },
        system: {
          enabled: true,
          collectInterval: 30000, // Collect every 30 seconds
        },
        business: {
          enabled: true,
        },
      },
      tags: {
        environment: 'production',
        region: 'us-west',
        team: 'platform',
      },
    }),
  ],
})
export class AppModule {}
```

## HTTP Metrics Tracking

### Automatic Request Tracking

HTTP metrics are automatically collected for all endpoints. No additional configuration needed.

### Manual Route Decoration

You can add custom tracking to specific routes:

```typescript
// users.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { TrackMetric } from '@skills-base/shared';

@Controller('users')
export class UsersController {
  @Post()
  @TrackMetric({
    name: 'user_creation',
    eventType: 'user_signup',
    labels: { source: 'api' },
  })
  async createUser(@Body() userData: CreateUserDto) {
    // Your implementation
  }
}
```

## Business Metrics Tracking

### Injecting the Metrics Service

```typescript
// users.service.ts
import { Injectable } from '@nestjs/common';
import { ApplicationMetricsService } from '@skills-base/shared';

@Injectable()
export class UsersService {
  constructor(private readonly metricsService: ApplicationMetricsService) {}

  async trackUserActivity() {
    // Track active users by role
    this.metricsService.trackActiveUsers(42, 'admin');

    // Track business events
    this.metricsService.trackBusinessEvent('user_login', 'success');
  }
}
```

## System Metrics

System metrics are collected automatically and include:

- Memory usage
- CPU usage
- Event loop lag
- Default Node.js metrics

### Accessing System Metrics

```typescript
// health.service.ts
import { Injectable } from '@nestjs/common';
import { SystemMetricsService } from '@skills-base/shared';

@Injectable()
export class HealthService {
  constructor(private readonly systemMetrics: SystemMetricsService) {}

  async getMetrics() {
    return await this.systemMetrics.getMetrics();
  }
}
```

## Environment Configuration

### Using Environment Variables

You can configure the module using environment variables:

```bash
# .env
SERVICE_NAME=my-service
METRICS_ENABLED=true
METRICS_SAMPLE_RATE=0.5
HTTP_METRICS_ENABLED=true
METRICS_HTTP_BUCKETS=0.1,0.3,0.5,1,2,5
METRICS_EXCLUDE_PATHS=/health,/metrics
SYSTEM_METRICS_ENABLED=true
METRICS_COLLECT_INTERVAL=30000
BUSINESS_METRICS_ENABLED=true
```

### Development Configuration

For development environments:

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { MonitoringModule } from '@skills-base/shared';

@Module({
  imports: [
    MonitoringModule.forRoot({
      serviceName: 'my-service-dev',
      metrics: {
        system: {
          collectInterval: 30000, // Longer interval for development
        },
        http: {
          excludePaths: ['/health', '/metrics', '/__webpack_hmr'], // Dev-specific paths
        },
      },
      tags: {
        environment: 'development',
      },
    }),
  ],
})
export class AppModule {}
```

## Prometheus Integration

The module exposes metrics in Prometheus format at the `/metrics` endpoint. Sample response:

```text
# HELP my_service_http_requests_total Total number of HTTP requests
# TYPE my_service_http_requests_total counter
my_service_http_requests_total{method="POST",path="/api/users",status="200",service="my-service"} 42

# HELP my_service_http_request_duration_seconds Duration of HTTP requests in seconds
# TYPE my_service_http_request_duration_seconds histogram
my_service_http_request_duration_seconds_bucket{le="0.1",method="POST",path="/api/users",status="200",service="my-service"} 35
...

# HELP my_service_memory_usage_bytes Process memory usage in bytes
# TYPE my_service_memory_usage_bytes gauge
my_service_memory_usage_bytes{type="heapUsed",service="my-service"} 67108864
```

## Best Practices

1. **Service Naming**

   - Use consistent service names across your infrastructure
   - Include environment/region in tags, not in service name

2. **HTTP Metrics**

   - Exclude health check and metrics endpoints to reduce noise
   - Use path normalization for dynamic routes
   - Consider sampling rate in high-traffic services

3. **Business Metrics**

   - Use consistent event type names
   - Add relevant labels for better filtering
   - Track both success and error cases

4. **System Metrics**

   - Adjust collection interval based on environment
   - Monitor event loop lag for performance issues
   - Use appropriate memory thresholds for alerts

5. **Resource Considerations**
   - Use appropriate sampling rates in production
   - Clean up custom metrics when no longer needed
   - Consider storage requirements for long-term metrics

## Troubleshooting

### Common Issues

1. **High Memory Usage**

   - Reduce metric cardinality
   - Increase sampling rate
   - Clean up unused metrics

2. **Missing Metrics**

   - Verify module configuration
   - Check metric name sanitization
   - Ensure proper service name

3. **Performance Impact**
   - Adjust collection intervals
   - Review histogram bucket configuration
   - Optimize label cardinality

### Debug Mode

Enable debug mode for detailed logging:

```typescript
MonitoringModule.forRoot({
  serviceName: 'my-service',
  enabled: true,
  tags: {
    debug: 'true',
  },
});
```

## API Reference

### Configuration Options

```typescript
interface MonitoringConfig {
  serviceName: string;
  enabled: boolean;
  sampleRate: number;
  metrics: {
    http: {
      enabled: boolean;
      buckets: number[];
      excludePaths: string[];
    };
    system: {
      enabled: boolean;
      collectInterval: number;
    };
    business: {
      enabled: boolean;
    };
  };
  tags: Record<string, string>;
}
```

### Available Decorators

```typescript
@TrackMetric({
  name?: string;
  eventType?: string;
  labels?: Record<string, string>;
})
```

### Service Methods

```typescript
// ApplicationMetricsService
trackHttpRequest(method: string, path: string, status: number, duration: number): void;
trackHttpRequestProgress(method: string, path: string, isStarting: boolean): void;
trackActiveUsers(count: number, role: string): void;
trackBusinessEvent(eventType: string, status: string): void;

// SystemMetricsService
getMetrics(): Promise<string>;
getContentType(): string;
clearMetrics(): Promise<void>;
```
