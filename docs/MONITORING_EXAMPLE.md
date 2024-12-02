# Monitoring Implementation Example

This example demonstrates practical implementation of monitoring in a NestJS service using the shared monitoring system.

## Example Service Structure

```
your-service/
├── src/
│   ├── orders/
│   │   ├── orders.controller.ts    # Controller with metrics
│   │   ├── orders.service.ts       # Service with metrics
│   │   └── orders.module.ts        # Module with monitoring
│   ├── app.module.ts
│   └── main.ts
```

## Implementation Example

### 1. orders.controller.ts

```typescript
import { Controller, Get, Post, Body } from '@nestjs/common';
import { TrackMetric } from '@skills-base/shared/decorators';
import { ApplicationMetricsService } from '@skills-base/shared';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private ordersService: OrdersService,
    private readonly metricsService: ApplicationMetricsService,
  ) {}

  @Get()
  @TrackMetric({
    name: 'orders_list_request',
    eventType: 'orders.list',
  })
  async findAll() {
    const startTime = Date.now();

    try {
      const orders = await this.ordersService.findAll();

      this.metricsService.trackHttpRequest('GET', '/orders', 200, (Date.now() - startTime) / 1000);

      return orders;
    } catch (error) {
      this.metricsService.trackHttpRequest(
        'GET',
        '/orders',
        error.status || 500,
        (Date.now() - startTime) / 1000,
      );
      throw error;
    }
  }

  @Post()
  @TrackMetric({
    name: 'orders_create_request',
    eventType: 'orders.create',
  })
  async create(@Body() order: any) {
    const startTime = Date.now();

    try {
      // Track in-progress request
      this.metricsService.trackHttpRequestProgress('POST', '/orders', true);

      const result = await this.ordersService.create(order);

      // Track business metric for successful order
      this.metricsService.trackBusinessEvent('order_created', 'success');

      // Track request completion
      this.metricsService.trackHttpRequest('POST', '/orders', 201, (Date.now() - startTime) / 1000);

      return result;
    } catch (error) {
      this.metricsService.trackBusinessEvent('order_created', 'error');
      this.metricsService.trackHttpRequest(
        'POST',
        '/orders',
        error.status || 500,
        (Date.now() - startTime) / 1000,
      );
      throw error;
    } finally {
      this.metricsService.trackHttpRequestProgress('POST', '/orders', false);
    }
  }
}
```

### 2. orders.service.ts

```typescript
import { Injectable } from '@nestjs/common';
import { ApplicationMetricsService, SystemMetricsService } from '@skills-base/shared';

@Injectable()
export class OrdersService {
  private activeOrders: number = 0;

  constructor(
    private readonly appMetrics: ApplicationMetricsService,
    private readonly systemMetrics: SystemMetricsService,
  ) {
    // Track active orders gauge
    setInterval(() => {
      this.appMetrics.trackActiveUsers(this.activeOrders, 'orders');
    }, 5000);
  }

  async findAll() {
    const startTime = process.hrtime();

    try {
      // Database query here
      const orders = [
        /* orders */
      ];

      // Track query duration
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const duration = seconds + nanoseconds / 1e9;

      // Custom histogram for query duration
      this.appMetrics
        .createMetric(
          'histogram',
          'orders_query_duration_seconds',
          'Duration of orders query in seconds',
        )
        .observe({ operation: 'findAll' }, duration);

      return orders;
    } catch (error) {
      this.appMetrics.trackBusinessEvent('orders_query', 'error');
      throw error;
    }
  }

  async create(order: any) {
    this.activeOrders++;

    try {
      // Create order in database
      const result = { id: 'new-id', ...order };

      // Track successful creation
      this.appMetrics.trackBusinessEvent('order_creation', 'success');

      // Track order value
      this.appMetrics
        .createMetric('histogram', 'order_value_dollars', 'Value of orders in dollars')
        .observe({ type: order.type }, order.value);

      return result;
    } catch (error) {
      this.appMetrics.trackBusinessEvent('order_creation', 'error');
      throw error;
    } finally {
      this.activeOrders--;
    }
  }
}
```

### 3. orders.module.ts (optional)

```typescript
import { Module } from '@nestjs/common';
import { MonitoringModule } from '@skills-base/shared';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

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
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
```

### 4. app.module.ts (required)

```typescript
import { Module } from '@nestjs/common';
import { MonitoringModule } from '@skills-base/shared';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    MonitoringModule.forRoot({
      serviceName: 'orders-service',
      enabled: true,
      sampleRate: 1,
      metrics: {
        http: {
          enabled: true,
          buckets: [0.1, 0.5, 1, 2, 5],
          excludePaths: ['/health'],
        },
        system: {
          enabled: true,
          collectInterval: 10000,
        },
        business: {
          enabled: true,
        },
      },
      tags: {
        environment: process.env.NODE_ENV,
      },
    }),
    OrdersModule,
  ],
})
export class AppModule {}
```

## Viewing Metrics

### 1. Prometheus Endpoint

Metrics are exposed at `/metrics` endpoint:

```text
# HELP orders_service_http_requests_total Total number of HTTP requests
# TYPE orders_service_http_requests_total counter
orders_service_http_requests_total{method="GET",path="/orders",status="200"} 42

# HELP orders_service_http_request_duration_seconds Duration of HTTP requests in seconds
# TYPE orders_service_http_request_duration_seconds histogram
orders_service_http_request_duration_seconds_bucket{method="GET",path="/orders",status="200",le="0.1"} 35
orders_service_http_request_duration_seconds_bucket{method="GET",path="/orders",status="200",le="0.5"} 40
orders_service_http_request_duration_seconds_bucket{method="GET",path="/orders",status="200",le="1"} 41
orders_service_http_request_duration_seconds_bucket{method="GET",path="/orders",status="200",le="2"} 42
orders_service_http_request_duration_seconds_bucket{method="GET",path="/orders",status="200",le="5"} 42
orders_service_http_request_duration_seconds_bucket{method="GET",path="/orders",status="200",le="+Inf"} 42

# HELP orders_service_active_users Number of currently active users
# TYPE orders_service_active_users gauge
orders_service_active_users{role="orders"} 3

# HELP orders_service_business_events_total Total number of business events
# TYPE orders_service_business_events_total counter
orders_service_business_events_total{event_type="order_created",status="success"} 156
```

### 2. Testing with Metrics

```typescript
import { Test } from '@nestjs/testing';
import { ApplicationMetricsService } from '@skills-base/shared';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;
  let metricsService: ApplicationMetricsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [OrdersService, ApplicationMetricsService],
    }).compile();

    controller = module.get(OrdersController);
    metricsService = module.get(ApplicationMetricsService);

    jest.spyOn(metricsService, 'trackHttpRequest');
    jest.spyOn(metricsService, 'trackBusinessEvent');
  });

  it('should track order creation', async () => {
    const order = { type: 'standard', value: 100 };
    await controller.create(order);

    expect(metricsService.trackBusinessEvent).toHaveBeenCalledWith('order_created', 'success');

    expect(metricsService.trackHttpRequest).toHaveBeenCalledWith(
      'POST',
      '/orders',
      201,
      expect.any(Number),
    );
  });
});
```
