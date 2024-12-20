import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';
import { BaseMetricsService } from './base-metrics.service';

@Injectable()
export class ApplicationMetricsService extends BaseMetricsService {
  private httpMetrics: {
    requestsTotal: client.Counter;
    requestDuration: client.Histogram;
    requestsInProgress: client.Gauge;
  };

  private businessMetrics: {
    activeUsers: client.Gauge;
    eventsTotal: client.Counter;
  };

  private systemMetrics: {
    memoryUsage: client.Gauge;
    cpuUsage: client.Gauge;
    eventLoopLag: client.Gauge;
  };

  private applicationMetrics: {
    errorRate: client.Counter;
    warningRate: client.Counter;
    responseTime: client.Histogram;
  };

  protected initializeMetrics(): void {
    // Initialize HTTP metrics
    this.httpMetrics = {
      requestsTotal: this.createMetric<client.Counter>(
        'counter',
        'http_requests_total',
        'Total number of HTTP requests',
        ['method', 'path', 'status'],
      ),
      requestDuration: this.createMetric<client.Histogram>(
        'histogram',
        'http_request_duration_seconds',
        'Duration of HTTP requests in seconds',
        ['method', 'path', 'status'],
      ),
      requestsInProgress: this.createMetric<client.Gauge>(
        'gauge',
        'http_requests_in_progress',
        'Number of HTTP requests currently in progress',
        ['method', 'path'],
      ),
    };

    // Initialize Business metrics
    this.businessMetrics = {
      activeUsers: this.createMetric<client.Gauge>(
        'gauge',
        'active_users',
        'Number of currently active users',
        ['role'],
      ),
      eventsTotal: this.createMetric<client.Counter>(
        'counter',
        'business_events_total',
        'Total number of business events',
        ['event_type', 'status'],
      ),
    };

    // Add new system metrics
    this.systemMetrics = {
      memoryUsage: this.createMetric<client.Gauge>(
        'gauge',
        'memory_usage_bytes',
        'Memory usage in bytes',
        ['type'],
      ),
      cpuUsage: this.createMetric<client.Gauge>(
        'gauge',
        'cpu_usage_percent',
        'CPU usage percentage',
        ['core'],
      ),
      eventLoopLag: this.createMetric<client.Gauge>(
        'gauge',
        'event_loop_lag_seconds',
        'Event loop lag in seconds',
      ),
    };

    // Add new application metrics
    this.applicationMetrics = {
      errorRate: this.createMetric<client.Counter>(
        'counter',
        'error_total',
        'Total number of errors',
        ['type', 'service'],
      ),
      warningRate: this.createMetric<client.Counter>(
        'counter',
        'warning_total',
        'Total number of warnings',
        ['type', 'service'],
      ),
      responseTime: this.createMetric<client.Histogram>(
        'histogram',
        'response_time_seconds',
        'Response time in seconds',
        ['endpoint', 'method'],
      ),
    };

    // Enable default metrics
    client.collectDefaultMetrics({
      register: this.register,
      // prefix: `${this.serviceName}_`,
      labels: { service: this.serviceName },
    });
  }

  // HTTP Metrics
  trackHttpRequest(
    method: string,
    path: string,
    status: number,
    duration: number,
  ): void {
    const labels = {
      method,
      path: this.normalizePath(path),
      status: status.toString(),
      service: this.serviceName,
    };

    this.httpMetrics.requestsTotal.inc(labels);
    this.httpMetrics.requestDuration.observe(labels, duration);
  }

  trackHttpRequestProgress(
    method: string,
    path: string,
    isStarting: boolean,
  ): void {
    const labels = {
      method,
      path: this.normalizePath(path),
      service: this.serviceName,
    };

    if (isStarting) {
      this.httpMetrics.requestsInProgress.inc(labels);
    } else {
      this.httpMetrics.requestsInProgress.dec(labels);
    }
  }

  // Business Metrics
  trackActiveUsers(count: number, role: string): void {
    this.businessMetrics.activeUsers.set(
      { role, service: this.serviceName },
      count,
    );
  }

  trackBusinessEvent(eventType: string, status: string): void {
    this.businessMetrics.eventsTotal.inc({
      event_type: eventType,
      status,
      service: this.serviceName,
    });
  }

  trackSystemMetrics(): void {
    this.systemMetrics.memoryUsage.set(
      { type: 'rss', service: this.serviceName },
      process.memoryUsage().rss,
    );
    this.systemMetrics.memoryUsage.set(
      { type: 'heapTotal', service: this.serviceName },
      process.memoryUsage().heapTotal,
    );
    this.systemMetrics.memoryUsage.set(
      { type: 'heapUsed', service: this.serviceName },
      process.memoryUsage().heapUsed,
    );
  }

  trackApplicationMetrics(): void {
    this.applicationMetrics.errorRate.inc({
      type: 'error',
      service: this.serviceName,
    });
    this.applicationMetrics.warningRate.inc({
      type: 'warning',
      service: this.serviceName,
    });
  }
}
