import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';
import { Registry } from 'prom-client';

@Injectable()
export class PrometheusService {
  private readonly register: Registry;
  private readonly metrics: Map<
    string,
    client.Counter | client.Gauge | client.Histogram
  > = new Map();
  private readonly defaultBuckets = [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10];

  constructor(private readonly serviceName: string) {
    this.register = new client.Registry();

    // Sanitize service name for use in metrics
    const safeServiceName = this.sanitizeMetricName(this.serviceName);

    // Enable default metrics with sanitized prefix
    client.collectDefaultMetrics({
      register: this.register,
      prefix: `${safeServiceName}_`,
      labels: { service: this.serviceName },
    });
  }

  private sanitizeMetricName(name: string): string {
    // Prometheus metric names must match [a-zA-Z_:][a-zA-Z0-9_:]*
    return name
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_') // Replace invalid chars with underscore
      .replace(/^[^a-z_]/, '_$&') // Ensure starts with letter or underscore
      .replace(/__+/g, '_') // Replace multiple underscores with single
      .replace(/^_+|_+$/g, ''); // Trim leading/trailing underscores
  }

  getContentType(): string {
    return this.register.contentType;
  }

  async getMetrics(): Promise<string> {
    return await this.register.metrics();
  }

  getCounter(
    name: string,
    help: string,
    labelNames: string[] = [],
  ): client.Counter {
    const safeName = this.sanitizeMetricName(`${this.serviceName}_${name}`);
    const key = `counter_${safeName}`;

    if (!this.metrics.has(key)) {
      const counter = new client.Counter({
        name: safeName,
        help,
        labelNames: [...labelNames, 'service'],
        registers: [this.register],
      });
      this.metrics.set(key, counter);
    }
    return this.metrics.get(key) as client.Counter;
  }

  getGauge(
    name: string,
    help: string,
    labelNames: string[] = [],
  ): client.Gauge {
    const safeName = this.sanitizeMetricName(`${this.serviceName}_${name}`);
    const key = `gauge_${safeName}`;

    if (!this.metrics.has(key)) {
      const gauge = new client.Gauge({
        name: safeName,
        help,
        labelNames: [...labelNames, 'service'],
        registers: [this.register],
      });
      this.metrics.set(key, gauge);
    }
    return this.metrics.get(key) as client.Gauge;
  }

  getHistogram(
    name: string,
    help: string,
    labelNames: string[] = [],
    buckets: number[] = this.defaultBuckets,
  ): client.Histogram {
    const safeName = this.sanitizeMetricName(`${this.serviceName}_${name}`);
    const key = `histogram_${safeName}`;

    if (!this.metrics.has(key)) {
      const histogram = new client.Histogram({
        name: safeName,
        help,
        labelNames: [...labelNames, 'service'],
        buckets,
        registers: [this.register],
      });
      this.metrics.set(key, histogram);
    }
    return this.metrics.get(key) as client.Histogram;
  }

  async clearMetrics(): Promise<void> {
    await this.register.clear();
  }
}
