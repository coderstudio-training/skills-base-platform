import { DynamicModule, Module, Provider } from '@nestjs/common';
import { MonitoringConfigurationManager } from '../config/monitoring.config';
import { MetricsController } from '../controllers/metrics.controller';
import { MetricsInterceptor } from '../interceptors/metrics.interceptor';
import { MonitoringConfig } from '../interfaces/monitoring.interfaces';
import { ApplicationMetricsService } from '../services/prometheus.service';
import { SystemMetricsService } from '../services/system-metrics.service';

@Module({})
export class MonitoringModule {
  static forRoot(config?: Partial<MonitoringConfig>): DynamicModule {
    const configManager = MonitoringConfigurationManager.getInstance();

    if (config) {
      configManager.updateConfig(config);
    }

    const finalConfig = configManager.getConfig();

    const providers: Provider[] = [
      {
        provide: 'MONITORING_CONFIG',
        useValue: finalConfig,
      },
      {
        provide: ApplicationMetricsService,
        useFactory: () =>
          new ApplicationMetricsService(finalConfig.serviceName),
      },
      {
        provide: SystemMetricsService,
        useFactory: () => new SystemMetricsService(finalConfig.serviceName),
      },
      MetricsInterceptor,
    ];

    const exports = [
      ApplicationMetricsService,
      SystemMetricsService,
      MetricsInterceptor,
      'MONITORING_CONFIG',
    ];

    // Only include controllers if metrics are enabled
    const controllers = finalConfig.enabled ? [MetricsController] : [];

    return {
      module: MonitoringModule,
      controllers,
      providers,
      exports,
      global: true,
    };
  }
}
