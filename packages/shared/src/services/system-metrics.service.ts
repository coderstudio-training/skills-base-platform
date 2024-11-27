import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as client from 'prom-client';
import { BaseMetricsService } from './base-metrics.service';

@Injectable()
export class SystemMetricsService
  extends BaseMetricsService
  implements OnModuleInit, OnModuleDestroy
{
  private systemMetrics: {
    memory: client.Gauge;
    cpu: client.Gauge;
    eventLoop: client.Histogram;
  };
  private collectInterval: NodeJS.Timer | null = null;

  protected initializeMetrics(): void {
    this.systemMetrics = {
      memory: this.createMetric<client.Gauge>(
        'gauge',
        'memory_usage_bytes',
        'Process memory usage in bytes',
        ['type'],
      ),
      cpu: this.createMetric<client.Gauge>(
        'gauge',
        'cpu_usage_seconds_total',
        'Process CPU usage in seconds',
        ['type'],
      ),
      eventLoop: this.createMetric<client.Histogram>(
        'histogram',
        'event_loop_lag_seconds',
        'Event loop lag in seconds',
      ),
    };
  }

  onModuleInit(): void {
    this.collectInterval = setInterval(() => this.collectMetrics(), 10000);
  }

  onModuleDestroy(): void {
    if (this.collectInterval) {
      clearInterval(this.collectInterval as NodeJS.Timeout);
    }
  }

  private collectMetrics(): void {
    // Memory metrics
    const memory = process.memoryUsage();
    Object.entries(memory).forEach(([type, value]) => {
      this.systemMetrics.memory.set({ type, service: this.serviceName }, value);
    });

    // CPU metrics
    const cpu = process.cpuUsage();
    Object.entries(cpu).forEach(([type, value]) => {
      this.systemMetrics.cpu.set(
        { type, service: this.serviceName },
        value / 1000000,
      );
    });

    // Event loop lag
    const start = process.hrtime();
    setImmediate(() => {
      const [seconds, nanoseconds] = process.hrtime(start);
      this.systemMetrics.eventLoop.observe(seconds + nanoseconds / 1e9);
    });
  }
}
