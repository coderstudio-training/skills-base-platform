import { Injectable } from '@nestjs/common';
import { Monitor } from './monitor';

export enum MetricType {
  Counter = 'counter',
  Gauge = 'gauge',
  Histogram = 'histogram',
  Summary = 'summary',
}

interface PrometheusMetric {
  name: string;
  help: string;
  type: MetricType;
  values: Array<{
    labels: Record<string, string>;
    value: number;
  }>;
}

@Injectable()
export class PrometheusAdapter {
  private readonly metricTypes: Map<string, MetricType> = new Map([
    ['http.requests.active', MetricType.Gauge],
    ['http.response.time', MetricType.Histogram],
    ['http.response.status', MetricType.Counter],
    ['memory.usage', MetricType.Gauge],
    ['cpu.usage', MetricType.Gauge],
    ['dependency.*.duration', MetricType.Histogram],
    ['operation.duration', MetricType.Histogram],
  ]);

  private readonly metricHelp: Map<string, string> = new Map([
    ['http.requests.active', 'Number of currently active HTTP requests'],
    ['http.response.time', 'HTTP response time in milliseconds'],
    ['http.response.status', 'HTTP response status codes count'],
    ['memory.usage', 'Current memory usage in bytes'],
    ['cpu.usage', 'Current CPU usage percentage'],
    ['dependency.*.duration', 'External dependency call duration'],
    ['operation.duration', 'Operation execution duration'],
  ]);

  // Histogram buckets for different metric types
  private readonly histogramBuckets = {
    'http.response.time': [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
    'dependency.*.duration': [1, 5, 10, 25, 50, 100, 250, 500, 1000],
    'operation.duration': [1, 5, 10, 25, 50, 100, 250, 500, 1000],
  };

  constructor(private readonly monitor: Monitor) {}

  private normalizeMetricName(name: string): string {
    // Convert dots to underscores and remove any invalid characters
    return name
      .replace(/\./g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '_')
      .replace(/__+/g, '_');
  }

  private getMetricType(metricName: string): MetricType {
    // Check for exact matches first
    if (this.metricTypes.has(metricName)) {
      return this.metricTypes.get(metricName)!;
    }

    // Check for wildcard patterns
    for (const [pattern, type] of this.metricTypes.entries()) {
      if (
        pattern.includes('*') &&
        new RegExp(pattern.replace('*', '.*')).test(metricName)
      ) {
        return type;
      }
    }

    // Default to gauge if no match found
    return MetricType.Gauge;
  }

  private getMetricHelp(metricName: string): string {
    // Similar pattern matching as getMetricType
    if (this.metricHelp.has(metricName)) {
      return this.metricHelp.get(metricName)!;
    }

    for (const [pattern, help] of this.metricHelp.entries()) {
      if (
        pattern.includes('*') &&
        new RegExp(pattern.replace('*', '.*')).test(metricName)
      ) {
        return help;
      }
    }

    return `${metricName} metric`;
  }

  private formatLabels(labels: Record<string, string>): string {
    return Object.entries(labels)
      .map(([key, value]) => `${key}="${value.replace(/"/g, '\\"')}"`)
      .join(',');
  }

  private createHistogramBuckets(
    metricName: string,
    values: number[],
  ): Record<string, number> {
    const buckets: Record<string, number> = {};
    const metricBuckets = this.getHistogramBuckets(metricName);

    metricBuckets.forEach((bucket) => {
      buckets[bucket] = values.filter((v) => v <= bucket).length;
    });

    // Add +Inf bucket
    buckets['Inf'] = values.length;

    return buckets;
  }

  private getHistogramBuckets(metricName: string): number[] {
    // Check for exact matches first
    for (const [pattern, buckets] of Object.entries(this.histogramBuckets)) {
      if (pattern.includes('*')) {
        if (new RegExp(pattern.replace('*', '.*')).test(metricName)) {
          return buckets;
        }
      } else if (pattern === metricName) {
        return buckets;
      }
    }

    // Default buckets if no match found
    return [1, 5, 10, 25, 50, 100, 250, 500, 1000];
  }

  /**
   * Generate Prometheus format metrics output
   */
  generateMetrics(): string {
    const metrics = this.monitor.getMetrics();
    const promMetrics: PrometheusMetric[] = [];

    for (const [fullName, data] of Object.entries(metrics)) {
      const [name, labelStr] = fullName.split(':', 2);
      const labels = labelStr ? JSON.parse(labelStr) : {};
      const type = this.getMetricType(name);
      const normalizedName = this.normalizeMetricName(name);

      let metric = promMetrics.find((m) => m.name === normalizedName);
      if (!metric) {
        metric = {
          name: normalizedName,
          help: this.getMetricHelp(name),
          type,
          values: [],
        };
        promMetrics.push(metric);
      }

      if (type === MetricType.Histogram) {
        const buckets = this.createHistogramBuckets(name, [data.current]);
        Object.entries(buckets).forEach(([bucket, count]) => {
          metric!.values.push({
            labels: { ...labels, le: bucket },
            value: count,
          });
        });
        // Add sum and count
        metric.values.push({
          labels: { ...labels, type: 'sum' },
          value: data.current,
        });
        metric.values.push({
          labels: { ...labels, type: 'count' },
          value: data.count,
        });
      } else {
        metric.values.push({
          labels,
          value: data.current,
        });
      }
    }

    // Generate Prometheus format output
    return promMetrics
      .map((metric) => {
        const lines = [
          `# HELP ${metric.name} ${metric.help}`,
          `# TYPE ${metric.name} ${metric.type}`,
          ...metric.values.map(({ labels, value }) => {
            const labelStr =
              Object.keys(labels).length > 0
                ? `{${this.formatLabels(labels)}}`
                : '';
            return `${metric.name}${labelStr} ${value}`;
          }),
        ];
        return lines.join('\n');
      })
      .join('\n\n');
  }
}
