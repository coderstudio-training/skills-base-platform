import { Injectable } from '@nestjs/common';
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

  trackRequest(req: any, res: any) {
    const timer = this.startTimer(`http.${req.method}.${req.route.path}`);

    res.on('finish', () => {
      const duration = timer.end();
      this.trackMetric('http.response.status', res.statusCode, {
        method: req.method,
        path: req.route.path,
        status: res.statusCode.toString(),
        duration: `${duration}ms`,
      });
    });
  }

  trackDependency(dependency: string, command: string, duration: number) {
    this.trackMetric(`dependency.${dependency}.duration`, duration, {
      command,
    });
  }
}
