// packages/shared/src/monitoring/monitoring.module.ts
import { DynamicModule, Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core';
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
        provide: 'SERVICE_NAME',
        useValue: options.serviceName,
      },
      // Provide Reflector
      Reflector,
      {
        provide: ApplicationMetricsService,
        useFactory: () => new ApplicationMetricsService(options.serviceName),
      },
      {
        provide: SystemMetricsService,
        useFactory: (serviceName: string) =>
          new SystemMetricsService(serviceName),
        inject: ['SERVICE_NAME'],
      },
      {
        provide: APP_INTERCEPTOR,
        useFactory: (
          metricsService: ApplicationMetricsService,
          reflector: Reflector,
        ) => {
          return new MetricsInterceptor(metricsService, reflector);
        },
        inject: [ApplicationMetricsService, Reflector],
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
