// logging.module.ts
import {
  DynamicModule,
  Global,
  Module,
  MiddlewareConsumer,
  NestModule,
} from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Logger } from './logger';
import { Monitor } from './monitor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ConfigurationManager } from './config';
import { MetricsInterceptor } from './interceptors/metrics.interceptor';
import { SystemMetricsService } from './services/system-metrics.service';
import { Reflector } from '@nestjs/core';
import { MetricsMiddleware } from './middlewares/metrics.middleware';
import { PrometheusService } from './services/prometheus.service';
import { MetricsController } from './controllers/metrics.controller';

export interface LoggingModuleOptions {
  serviceName?: string;
  environment?: string;
  enableMetrics?: boolean;
}

@Global()
@Module({})
export class LoggingModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply metrics middleware only if metrics are enabled
    const config = ConfigurationManager.getInstance();
    if (config.getMonitorConfig().enableMetrics) {
      consumer.apply(MetricsMiddleware).forRoutes('*');
    }
  }

  static forRoot(options: LoggingModuleOptions = {}): DynamicModule {
    const config = ConfigurationManager.getInstance();
    const serviceName = this.sanitizeServiceName(options.serviceName || 'app');
    const providers = [];
    const controllers = [];

    if (options.environment) {
      process.env.NODE_ENV = options.environment;
    }

    // Base logger provider (existing functionality)
    const loggerProvider = {
      provide: Logger,
      useFactory: () => {
        return new Logger(serviceName, config.getLoggerConfig());
      },
    };
    providers.push(loggerProvider);

    // Base monitor provider (existing functionality)
    const monitorProvider = {
      provide: Monitor,
      useFactory: () => {
        return new Monitor(serviceName, config.getMonitorConfig());
      },
    };
    providers.push(monitorProvider);
    // Add Prometheus monitoring if metrics are enabled
    if (config.getMonitorConfig().enableMetrics) {
      // Prometheus service
      const prometheusProvider = {
        provide: PrometheusService,
        useFactory: () => new PrometheusService(serviceName),
      };
      providers.push(prometheusProvider);

      // System metrics collector
      providers.push(SystemMetricsService);

      // Metrics interceptor
      providers.push({
        provide: APP_INTERCEPTOR,
        useFactory: (prometheusService: PrometheusService) =>
          new MetricsInterceptor(prometheusService, new Reflector()),
        inject: [PrometheusService],
      });

      // Add metrics controller
      controllers.push(MetricsController);
    }

    // Existing logging interceptor
    const loggingInterceptorProvider = {
      provide: APP_INTERCEPTOR,
      useFactory: (logger: Logger, monitor: Monitor) => {
        return new LoggingInterceptor(logger, monitor);
      },
      inject: [Logger, Monitor],
    };
    providers.push(loggingInterceptorProvider);

    return {
      module: LoggingModule,
      providers,
      controllers,
      exports: [
        Logger,
        Monitor,
        ...(config.getMonitorConfig().enableMetrics ? [PrometheusService] : []),
      ],
    };
  }
  private static sanitizeServiceName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/^[^a-z_]/, '_$&')
      .replace(/__+/g, '_')
      .replace(/^_+|_+$/g, '');
  }
  static forFeature(options: LoggingModuleOptions): DynamicModule {
    const serviceName = options.serviceName || 'feature';

    const loggerProvider = {
      provide: Logger,
      useFactory: () => {
        const config = ConfigurationManager.getInstance();
        return new Logger(serviceName, config.getLoggerConfig());
      },
    };

    return {
      module: LoggingModule,
      providers: [loggerProvider],
      exports: [Logger],
    };
  }
}
