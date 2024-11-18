import { Controller, Get, Header } from '@nestjs/common';
import { ApplicationMetricsService } from '../services/prometheus.service';
import { SystemMetricsService } from '../services/system-metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(
    private readonly appMetrics: ApplicationMetricsService,
    private readonly systemMetrics: SystemMetricsService,
  ) {}

  @Get()
  @Header('Content-Type', 'text/plain')
  async getMetrics(): Promise<string> {
    // Combine metrics from both services
    const appMetrics = await this.appMetrics.getMetrics();
    const sysMetrics = await this.systemMetrics.getMetrics();
    return `${appMetrics}\n${sysMetrics}`;
  }
}
