import { Controller, Get, Header } from '@nestjs/common';
import { PrometheusAdapter } from './prometheus-adapter';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly prometheusAdapter: PrometheusAdapter) {}

  @Get()
  @Header('Content-Type', 'text/plain')
  getMetrics(): string {
    return this.prometheusAdapter.generateMetrics();
  }
}
