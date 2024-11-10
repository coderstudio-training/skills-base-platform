import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrometheusService } from './prometheus.service';

@Injectable()
export class SystemMetricsService implements OnModuleInit, OnModuleDestroy {
  private readonly memoryUsage;
  private readonly cpuUsage;
  private readonly eventLoopLag;
  private collectInterval: NodeJS.Timer;

  constructor(private readonly prometheusService: PrometheusService) {
    this.memoryUsage = this.prometheusService.getGauge(
      'memory_usage_bytes',
      'Process memory usage in bytes',
      ['type'],
    );

    this.cpuUsage = this.prometheusService.getGauge(
      'cpu_usage_seconds_total',
      'Process CPU usage in seconds',
      ['type'],
    );

    this.eventLoopLag = this.prometheusService.getHistogram(
      'event_loop_lag_seconds',
      'Event loop lag in seconds',
    );
  }

  onModuleInit() {
    this.collectInterval = setInterval(() => this.collectMetrics(), 10000);
  }

  onModuleDestroy() {
    if (this.collectInterval) {
      clearInterval(this.collectInterval as NodeJS.Timeout);
    }
  }

  private collectMetrics() {
    // Memory metrics
    const memory = process.memoryUsage();
    this.memoryUsage.set({ type: 'heapUsed' }, memory.heapUsed);
    this.memoryUsage.set({ type: 'heapTotal' }, memory.heapTotal);
    this.memoryUsage.set({ type: 'rss' }, memory.rss);
    this.memoryUsage.set({ type: 'external' }, memory.external);

    // CPU metrics
    const cpu = process.cpuUsage();
    this.cpuUsage.set({ type: 'user' }, cpu.user / 1000000);
    this.cpuUsage.set({ type: 'system' }, cpu.system / 1000000);

    // Event loop lag
    const start = process.hrtime();
    setImmediate(() => {
      const [seconds, nanoseconds] = process.hrtime(start);
      this.eventLoopLag.observe(seconds + nanoseconds / 1e9);
    });
  }
}
