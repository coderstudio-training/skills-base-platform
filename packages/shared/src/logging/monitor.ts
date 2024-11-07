import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { MonitorOptions } from './types';

@Injectable()
export class Monitor {
  private metrics: Map<string, number[]> = new Map();
  private readonly options: Required<MonitorOptions>;

  constructor(
    private readonly service: string,
    options: MonitorOptions = {},
  ) {
    this.options = {
      enabled: true,
      sampleRate: 1,
      metricsInterval: 60000,
      tags: {},
      ...options,
    };

    if (this.options.enabled) {
      this.startMetricsCollection();
    }
  }

  private startMetricsCollection() {
    setInterval(() => {
      this.collectSystemMetrics();
    }, this.options.metricsInterval);
  }

  private collectSystemMetrics() {
    this.trackMetric('memory.usage', process.memoryUsage().heapUsed);
    this.trackMetric('cpu.usage', process.cpuUsage().user);
  }

  trackMetric(name: string, value: number, tags: Record<string, string> = {}) {
    if (!this.options.enabled) return;

    const metricKey = `${name}:${JSON.stringify({ ...this.options.tags, ...tags })}`;
    const currentValues = this.metrics.get(metricKey) || [];
    this.metrics.set(metricKey, [...currentValues, value]);
  }

  startTimer(name: string) {
    const start = process.hrtime();

    return {
      end: () => {
        const [seconds, nanoseconds] = process.hrtime(start);
        const duration = seconds * 1000 + nanoseconds / 1000000;
        this.trackMetric(`${name}.duration`, duration);
        return duration;
      },
    };
  }

  trackRequest(req: Request, res: Response) {
    // Use the actual URL path instead of route.path
    const path = req.originalUrl || req.url;
    const timer = this.startTimer(`http.${req.method.toLowerCase()}`);

    res.on('finish', () => {
      const duration = timer.end();
      this.trackMetric('http.response.status', res.statusCode, {
        method: req.method,
        path: path, // Use the captured path
        status: res.statusCode.toString(),
        duration: `${duration}ms`,
      });

      // Track response time
      this.trackMetric('http.response.time', duration, {
        method: req.method,
        path: path,
        status: res.statusCode.toString(),
      });

      // Track status code distribution
      this.trackMetric(`http.status.${Math.floor(res.statusCode / 100)}xx`, 1, {
        method: req.method,
        path: path,
      });
    });

    // Track concurrent requests
    this.trackMetric('http.requests.active', 1, {
      method: req.method,
      path: path,
    });

    res.on('close', () => {
      // Decrement active requests counter
      this.trackMetric('http.requests.active', -1, {
        method: req.method,
        path: path,
      });
    });
  }

  trackDependency(dependency: string, command: string, duration: number) {
    this.trackMetric(`dependency.${dependency}.duration`, duration, {
      command,
    });
  }

  // Add method to get current metrics
  getMetrics() {
    const result: Record<
      string,
      { current: number; avg: number; count: number }
    > = {};

    for (const [key, values] of this.metrics.entries()) {
      const sum = values.reduce((a, b) => a + b, 0);
      result[key] = {
        current: values[values.length - 1] || 0,
        avg: sum / values.length,
        count: values.length,
      };
    }

    return result;
  }

  // Add method to reset metrics
  resetMetrics() {
    this.metrics.clear();
  }
}
