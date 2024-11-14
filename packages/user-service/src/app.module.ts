// src/app.module.ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import {
  DatabaseModule,
  Logger,
  LoggerMiddleware,
  LoggingInterceptor,
  LoggingModule,
  MonitoringModule,
  SecurityMiddleware,
  SecurityModule,
  TransformInterceptor,
} from '@skills-base/shared';
import { AuthModule } from './auth/auth.module';
import { EmployeesModule } from './employees/employees.module';
import { UsersModule } from './users/users.module';

const SERVICE_NAME = 'user_service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggingModule.forRoot({
      serviceName: SERVICE_NAME,
      environment: process.env.NODE_ENV,
    }),
    MonitoringModule.forRoot({
      serviceName: SERVICE_NAME,
      enabled: true,
      sampleRate: 1,
      customBuckets: {
        http: [0.1, 0.3, 0.5, 0.7, 1, 2, 3, 5, 7, 10],
        operation: [0.01, 0.05, 0.1, 0.5, 1, 2.5, 5, 10],
      },
      tags: {
        environment: process.env.NODE_ENV || 'development',
      },
    }),
    SecurityModule.forRoot({
      rateLimit: {
        enabled: false,
        windowMs: 15 * 60 * 1000,
        max: 100,
        skipPaths: ['/metrics'],
      },
      apiKey: {
        enabled: false,
        keys: [],
        excludePaths: ['/metrics'],
      },
      ipWhitelist: {
        enabled: false,
        allowedIps: [],
      },
      payloadLimit: {
        maxSize: 10 * 1024 * 1024,
      },
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    EmployeesModule,
  ],
  providers: [
    {
      provide: Logger,
      useFactory: () => {
        return new Logger(SERVICE_NAME);
      },
    },
    {
      provide: APP_INTERCEPTOR,
      useFactory: (logger: Logger) => {
        return new LoggingInterceptor(logger);
      },
      inject: [Logger],
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply both security and logger middleware to all routes
    consumer.apply(SecurityMiddleware, LoggerMiddleware).forRoutes('*');
  }
}
