import { Controller, Get, Header } from '@nestjs/common';
import { PrometheusService } from '../services/prometheus.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly prometheusService: PrometheusService) {}

  @Get()
  @Header('Content-Type', 'text/plain')
  async getMetrics(): Promise<string> {
    return await this.prometheusService.getMetrics();
  }
}
