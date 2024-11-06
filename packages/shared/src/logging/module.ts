import { DynamicModule, Module } from '@nestjs/common';
import { Logger } from './logger';
import { Monitor } from './monitor';
import { LoggerOptions, MonitorOptions } from './types';

@Module({})
export class LoggingModule {
  static forRoot(
    options: {
      logger?: LoggerOptions;
      monitor?: MonitorOptions;
    } = {},
  ): DynamicModule {
    return {
      module: LoggingModule,
      providers: [
        {
          provide: Logger,
          useValue: new Logger('app', options.logger),
        },
        {
          provide: Monitor,
          useValue: new Monitor('app', options.monitor),
        },
      ],
      exports: [Logger, Monitor],
    };
  }
}
