import { Module } from '@nestjs/common';
import {
  DatabaseModule,
  LoggingModule,
  MonitoringModule,
  SecurityModule,
} from '@skills-base/shared';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    NotificationModule,
    DatabaseModule, // Configure Logging Module
    LoggingModule.forRoot({
      serviceName: 'integration-service',
      environment: process.env.NODE_ENV,
      enableGlobalInterceptor: true,
      skipPaths: ['/health', '/metrics'], // Optional: paths to skip logging
    }),

    // Configure Security Module
    SecurityModule.forRoot({
      rateLimit: {
        enabled: true,
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
      },
      apiKey: {
        enabled: false, // Enable if you want API keying
      },
      ipWhitelist: {
        enabled: false, // Enable if you want IP whitelisting
        allowedIps: [],
      },
      payload: {
        maxSize: 10 * 1024 * 1024, // 10MB
      },
    }),

    // Configure Monitoring Module
    MonitoringModule.forRoot({
      serviceName: 'integration-service',
      enabled: true,
      metrics: {
        http: {
          enabled: true,
          excludePaths: ['/health', '/metrics'],
        },
        system: {
          enabled: true,
          collectInterval: 10000, // 10 seconds
        },
      },
    }),
  ],
})
export class AppModule {}
