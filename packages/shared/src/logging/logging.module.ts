import { Module, DynamicModule, Global } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LoggerConfig } from './interfaces/logger-config.interface';

@Global()
@Module({})
export class LoggingModule {
  static forRoot(config: Partial<LoggerConfig>): DynamicModule {
    return {
      module: LoggingModule,
      providers: [
        {
          provide: LoggerService,
          useValue: new LoggerService(config),
        },
      ],
      exports: [LoggerService],
    };
  }
}
