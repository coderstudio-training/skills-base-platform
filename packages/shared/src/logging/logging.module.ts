import { DynamicModule, Global, Module } from '@nestjs/common';
import { Logger } from '.';
import { ConfigurationManager } from './logging.config';

export interface LoggingModuleOptions {
  serviceName?: string;
  environment?: string;
  enableMetrics?: boolean;
}

@Global()
@Module({})
export class LoggingModule {
  static forRoot(options: LoggingModuleOptions = {}): DynamicModule {
    const config = ConfigurationManager.getInstance();
    const serviceName = this.sanitizeServiceName(options.serviceName || 'app');

    // Set the global service name when initializing the root module
    Logger.setGlobalService(serviceName);

    if (options.environment) {
      process.env.NODE_ENV = options.environment;
    }

    const providers = [
      // Base logger provider
      {
        provide: Logger,
        useFactory: () => {
          return new Logger('root', config.getLoggerConfig());
        },
      },
      // Logging interceptor
      // {
      //   provide: APP_INTERCEPTOR,
      //   useClass: LoggingInterceptor,
      // },
    ];

    return {
      module: LoggingModule,
      providers,
      exports: [Logger],
      global: true,
    };
  }

  static forFeature(options: LoggingModuleOptions = {}): DynamicModule {
    const featureName = this.sanitizeServiceName(
      options.serviceName || 'feature',
    );

    return {
      module: LoggingModule,
      providers: [
        {
          provide: Logger,
          useFactory: () => {
            const config = ConfigurationManager.getInstance();
            return new Logger(featureName, config.getLoggerConfig());
          },
        },
      ],
      exports: [Logger],
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
}
