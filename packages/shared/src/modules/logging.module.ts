import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigurationManager } from '../config/logging.config';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { LoggingModuleOptions } from '../interfaces/logging.interfaces';
import { LoggerMiddleware } from '../middlewares/logger.middleware';
import { Logger } from '../services/logger.service';
import { StringUtils } from '../utils/string.utils';

@Global()
@Module({})
export class LoggingModule {
  // Create Logger Provider with a specific token
  private static createLoggerProvider(): Provider {
    return {
      provide: Logger,
      useFactory: () => {
        const configManager = ConfigurationManager.getInstance();
        return new Logger('root', configManager.getLoggerConfig());
      },
    };
  }

  // Create Interceptor Provider with proper injection
  private static createInterceptorProvider(): Provider {
    return {
      provide: APP_INTERCEPTOR,
      useFactory: (logger: Logger) => {
        return new LoggingInterceptor(logger);
      },
      inject: [Logger], // Explicitly inject Logger
    };
  }

  static forRoot(options: LoggingModuleOptions = {}): DynamicModule {
    const {
      serviceName,
      environment,
      enableRequestLogging = true,
      enableGlobalInterceptor = true,
    } = options;

    // Set environment if provided
    if (environment) {
      process.env.NODE_ENV = environment;
    }

    // Set global service name
    if (serviceName) {
      Logger.setGlobalService(StringUtils.validateServiceName(serviceName));
    }

    // Always include the Logger provider
    const providers: Provider[] = [LoggingModule.createLoggerProvider()];

    // Include the LoggerMiddleware with Logger injection
    providers.push({
      provide: LoggerMiddleware,
      useFactory: (logger: Logger) => new LoggerMiddleware(logger),
      inject: [Logger],
    });

    // Add interceptor if enabled
    if (enableRequestLogging && enableGlobalInterceptor) {
      providers.push(LoggingModule.createInterceptorProvider());
    }

    return {
      module: LoggingModule,
      providers,
      exports: [Logger],
      global: true,
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: LoggingModule,
      providers: [LoggingModule.createLoggerProvider()],
      exports: [Logger],
    };
  }
}
