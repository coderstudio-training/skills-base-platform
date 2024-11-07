import { DynamicModule, Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Logger } from './logger';
import { Monitor } from './monitor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ConfigurationManager } from './config';

export interface LoggingModuleOptions {
  serviceName?: string;
  environment?: string;
}

@Global()
@Module({})
export class LoggingModule {
  static forRoot(options: LoggingModuleOptions = {}): DynamicModule {
    const config = ConfigurationManager.getInstance();
    const serviceName = options.serviceName || 'app';

    // If environment is provided, override it
    if (options.environment) {
      process.env.NODE_ENV = options.environment;
    }

    const loggerProvider = {
      provide: Logger,
      useFactory: () => {
        return new Logger(serviceName, config.getLoggerConfig());
      },
    };

    const monitorProvider = {
      provide: Monitor,
      useFactory: () => {
        return new Monitor(serviceName, config.getMonitorConfig());
      },
    };

    const interceptorProvider = {
      provide: APP_INTERCEPTOR,
      useFactory: (logger: Logger, monitor: Monitor) => {
        return new LoggingInterceptor(logger, monitor);
      },
      inject: [Logger, Monitor],
    };

    return {
      module: LoggingModule,
      providers: [loggerProvider, monitorProvider, interceptorProvider],
      exports: [Logger, Monitor],
    };
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
