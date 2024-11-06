import { Monitor } from '../monitor';

export class PerformanceMonitor {
  private readonly monitor: Monitor;

  constructor(monitor: Monitor) {
    this.monitor = monitor;
  }

  trackDatabaseQuery(query: string, duration: number) {
    this.monitor.trackDependency('database', query, duration);
  }

  trackExternalCall(service: string, method: string, duration: number) {
    this.monitor.trackDependency(service, method, duration);
  }

  trackMemoryUsage() {
    const memory = process.memoryUsage();
    this.monitor.trackMetric('memory.heapUsed', memory.heapUsed);
    this.monitor.trackMetric('memory.heapTotal', memory.heapTotal);
    this.monitor.trackMetric('memory.rss', memory.rss);
  }

  trackCPUUsage() {
    const cpu = process.cpuUsage();
    this.monitor.trackMetric('cpu.user', cpu.user);
    this.monitor.trackMetric('cpu.system', cpu.system);
  }
}
