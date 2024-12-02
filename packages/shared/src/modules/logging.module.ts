import {
  DynamicModule,
  Global,
  MiddlewareConsumer,
  Module,
  NestModule,
  Provider,
  RequestMethod,
} from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigurationManager } from '../config/logging.config';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { LoggingModuleOptions } from '../interfaces/logging.interfaces';
import { LoggerMiddleware } from '../middlewares/logger.middleware';
import { Logger } from '../services/logger.service';
import { StringUtils } from '../utils/string.utils';

const DEFAULT_SKIP_PATHS = ['/health', '/metrics'];

@Global()
@Module({})
export class LoggingModule implements NestModule {
  private static skipPaths: string[] = [...DEFAULT_SKIP_PATHS];

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .exclude(
        ...LoggingModule.skipPaths.map((path) => ({
          path,
          method: RequestMethod.ALL,
        })),
      )
      .forRoutes('*');
  }

  static forRoot(options: LoggingModuleOptions = {}): DynamicModule {
    const {
      serviceName,
      environment,
      enableGlobalInterceptor = true,
      skipPaths = [],
    } = options;

    // Combine default skip paths with custom skip paths
    LoggingModule.skipPaths = [...DEFAULT_SKIP_PATHS, ...skipPaths];

    if (environment) {
      process.env.NODE_ENV = environment;
    }

    // Set global service name
    const validServiceName = StringUtils.validateServiceName(serviceName);
    Logger.setGlobalService(validServiceName);

    const providers: Provider[] = [
      // Base Logger Provider
      {
        provide: Logger,
        useFactory: () => {
          const configManager = ConfigurationManager.getInstance();
          return new Logger('root', configManager.getLoggerConfig());
        },
      },
      LoggerMiddleware,
    ];

    // Add global interceptor if enabled
    if (enableGlobalInterceptor) {
      providers.push({
        provide: APP_INTERCEPTOR,
        useClass: LoggingInterceptor,
      });
    }

    return {
      module: LoggingModule,
      providers,
      exports: [Logger],
      global: true,
    };
  }

  static forFeature(options: LoggingModuleOptions = {}): DynamicModule {
    const { serviceName } = options;

    return {
      module: LoggingModule,
      providers: [
        {
          provide: Logger,
          useFactory: () => {
            const configManager = ConfigurationManager.getInstance();
            return new Logger(
              StringUtils.validateServiceName(serviceName),
              configManager.getLoggerConfig(),
            );
          },
        },
      ],
      exports: [Logger],
    };
  }
}
