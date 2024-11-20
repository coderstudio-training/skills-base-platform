import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export abstract class BaseMetricsService {
  protected readonly register: client.Registry;
  protected readonly metrics = new Map<
    string,
    client.Counter | client.Gauge | client.Histogram
  >();
  protected readonly defaultBuckets = [0.1, 0.3, 0.5, 0.7, 1, 2, 3, 5, 7, 10];

  constructor(protected readonly serviceName: string) {
    this.register = new client.Registry();
    this.initializeMetrics();
  }

  protected abstract initializeMetrics(): void;

  protected createMetric<
    T extends client.Counter | client.Gauge | client.Histogram,
  >(
    type: 'counter' | 'gauge' | 'histogram',
    name: string,
    help: string,
    labelNames: string[] = [],
    options: Partial<client.MetricConfiguration<any>> = {},
  ): T {
    // const safeName = this.sanitizeMetricName(`${this.serviceName}_${name}`);
    const safeName = this.sanitizeMetricName(`${name}`);
    const key = `${type}_${safeName}`;

    if (!this.metrics.has(key)) {
      const config = {
        name: safeName,
        help,
        labelNames: [...labelNames, 'service'],
        registers: [this.register],
        ...options,
      };

      let metric: client.Counter | client.Gauge | client.Histogram;
      switch (type) {
        case 'counter':
          metric = new client.Counter(config);
          break;
        case 'gauge':
          metric = new client.Gauge(config);
          break;
        case 'histogram':
          metric = new client.Histogram({
            ...config,
            buckets: this.defaultBuckets,
          });
          break;
      }
      this.metrics.set(key, metric);
    }

    return this.metrics.get(key) as T;
  }

  protected sanitizeMetricName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/^[^a-z_]/, '_$&')
      .replace(/__+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  protected normalizePath(path: string): string {
    return path
      .replace(/\d+/g, ':id')
      .replace(/\/{2,}/g, '/')
      .toLowerCase();
  }

  async getMetrics(): Promise<string> {
    return await this.register.metrics();
  }

  getContentType(): string {
    return this.register.contentType;
  }

  async clearMetrics(): Promise<void> {
    return await this.register.clear();
  }
}
