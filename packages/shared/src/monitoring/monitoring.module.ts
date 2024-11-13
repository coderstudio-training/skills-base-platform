import { DynamicModule, Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MetricsController } from './controllers/metrics.controller';
import { MetricsInterceptor } from './interceptors/metrics.interceptor';
import { ApplicationMetricsService } from './services/prometheus.service';
import { SystemMetricsService } from './services/system-metrics.service';
import { MonitoringOptions } from './types';

@Global()
@Module({})
export class MonitoringModule {
  static forRoot(options: MonitoringOptions): DynamicModule {
    const providers = [
      {
        provide: ApplicationMetricsService,
        useFactory: () => new ApplicationMetricsService(options.serviceName),
      },
      SystemMetricsService,
      {
        provide: APP_INTERCEPTOR,
        useClass: MetricsInterceptor,
      },
    ];

    return {
      module: MonitoringModule,
      global: true,
      providers,
      controllers: [MetricsController],
      exports: [ApplicationMetricsService, SystemMetricsService],
    };
  }
}
