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
import { Logger } from './';
import { ConfigurationManager } from './config/logging.config';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { LoggingModuleOptions } from './types';
import { StringUtils } from './utils/string.utils';

const DEFAULT_SKIP_PATHS = ['/health', '/metrics'];

export interface LoggingModuleFactoryOptions extends LoggingModuleOptions {
  enableRequestLogging?: boolean;
  enableGlobalInterceptor?: boolean;
  enableMiddleware?: boolean;
  skipPaths?: string[];
}

@Global()
@Module({})
export class LoggingModule implements NestModule {
  private static enableMiddleware = true;
  private static skipPaths: string[] = [...DEFAULT_SKIP_PATHS];

  configure(consumer: MiddlewareConsumer) {
    if (LoggingModule.enableMiddleware) {
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
  }

  private static createInterceptorProvider(): Provider {
    return {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    };
  }

  private static createLoggerProvider(
    config?: LoggingModuleOptions['config'],
  ): Provider {
    return {
      provide: Logger,
      useFactory: () => {
        const configManager = ConfigurationManager.getInstance();

        if (config) {
          configManager.updateConfig(config);
        }

        return new Logger('root', configManager.getLoggerConfig());
      },
    };
  }

  static forRoot(options: LoggingModuleFactoryOptions = {}): DynamicModule {
    const {
      serviceName,
      environment,
      config,
      environmentConfigs,
      enableRequestLogging = true,
      enableGlobalInterceptor = true,
      enableMiddleware = true,
      skipPaths = [],
    } = options;

    LoggingModule.enableMiddleware = enableMiddleware;
    // Combine default skip paths with custom skip paths
    LoggingModule.skipPaths = [...DEFAULT_SKIP_PATHS, ...skipPaths];

    const configManager = ConfigurationManager.getInstance();

    if (environment) {
      process.env.NODE_ENV = environment;
    }

    if (environmentConfigs) {
      configManager.setEnvironmentConfigs(environmentConfigs);
    }

    Logger.setGlobalService(StringUtils.validateServiceName(serviceName));

    const providers: Provider[] = [
      this.createLoggerProvider(config),
      LoggerMiddleware,
    ];

    if (enableRequestLogging && enableGlobalInterceptor) {
      providers.push(this.createInterceptorProvider());
    }

    return {
      module: LoggingModule,
      providers,
      exports: [Logger],
      global: true,
    };
  }

  static forFeature(options: LoggingModuleOptions = {}): DynamicModule {
    const { serviceName, config } = options;

    return {
      module: LoggingModule,
      providers: [
        {
          provide: Logger,
          useFactory: () => {
            const configManager = ConfigurationManager.getInstance();

            if (config) {
              configManager.updateConfig(config);
            }

            return new Logger(
              StringUtils.validateServiceName(serviceName),
              configManager.getLoggerConfig(),
            );
          },
        },
        LoggerMiddleware,
      ],
      exports: [Logger],
    };
  }

  static forRootAsync(
    options: LoggingModuleFactoryOptions & {
      imports?: any[];
      inject?: any[];
      useFactory: (
        ...args: any[]
      ) => Promise<LoggingModuleOptions> | LoggingModuleOptions;
    },
  ): DynamicModule {
    const {
      imports,
      inject,
      useFactory,
      enableRequestLogging = true,
      enableGlobalInterceptor = true,
      enableMiddleware = true,
      skipPaths = [],
    } = options;

    LoggingModule.enableMiddleware = enableMiddleware;
    // Combine default skip paths with custom skip paths
    LoggingModule.skipPaths = [...DEFAULT_SKIP_PATHS, ...skipPaths];

    const asyncLoggerProvider: Provider = {
      provide: Logger,
      useFactory: async (...args: any[]) => {
        const moduleOptions = await useFactory(...args);
        const configManager = ConfigurationManager.getInstance();

        if (moduleOptions.environmentConfigs) {
          configManager.setEnvironmentConfigs(moduleOptions.environmentConfigs);
        }

        if (moduleOptions.config) {
          configManager.updateConfig(moduleOptions.config);
        }

        if (moduleOptions.environment) {
          process.env.NODE_ENV = moduleOptions.environment;
        }

        const validServiceName = StringUtils.validateServiceName(
          moduleOptions.serviceName,
        );
        Logger.setGlobalService(validServiceName);

        return new Logger('root', configManager.getLoggerConfig());
      },
      inject: inject || [],
    };

    const providers: Provider[] = [asyncLoggerProvider, LoggerMiddleware];

    if (enableRequestLogging && enableGlobalInterceptor) {
      providers.push(this.createInterceptorProvider());
    }

    return {
      module: LoggingModule,
      imports: imports || [],
      providers,
      exports: [Logger],
      global: true,
    };
  }
}
