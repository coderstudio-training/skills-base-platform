// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  DatabaseModule,
  LoggingModule,
  MonitoringModule,
  SecurityModule,
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
      payload: {
        maxSize: 10 * 1024 * 1024,
      },
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    EmployeesModule,
  ],
})
export class AppModule {}
