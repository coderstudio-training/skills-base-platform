import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  LoggingModule,
  MonitoringModule,
  SecurityModule,
} from '@skills-base/shared';
import { AppController } from './app.controller';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggingModule.forRoot({
      serviceName: 'email_service',
      environment: 'development',
    }),
    MonitoringModule.forRoot({
      serviceName: 'email_service',
      enabled: true,
      metrics: {
        http: {
          enabled: true,
          excludePaths: ['/health', '/metrics'],
        },
        system: {
          enabled: true,
          collectInterval: 30000,
        },
      },
      tags: {
        environment: process.env.NODE_ENV || 'development',
        service: 'email_service',
      },
    }),
    SecurityModule.forRoot({
      rateLimit: {
        enabled: true,
        windowMs: 15 * 60 * 1000,
        max: 1000,
        skipPaths: ['/health', '/metrics'],
      },
      apiKey: {
        enabled: false,
      },
      ipWhitelist: {
        enabled: false,
      },
    }),
    EmailModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
