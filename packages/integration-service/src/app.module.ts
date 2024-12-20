import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  DatabaseModule,
  LoggingModule,
  MonitoringModule,
  RedisModule,
  SecurityModule,
} from '@skills-base/shared';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    NotificationModule,
    DatabaseModule, // Configure Logging Module
    // Core Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
    }),

    // Logging Configuration
    LoggingModule.forRoot({
      serviceName: process.env.SERVICE_NAME || 'skills-service',
      environment: process.env.NODE_ENV,
      enableRequestLogging: true,
      enableGlobalInterceptor: true,
      skipPaths: (process.env.LOG_SKIP_PATHS || '/health,/metrics').split(','),
    }),

    // Security Configuration
    SecurityModule.forRoot({
      adminEmail: process.env.ADMIN_EMAIL,
      rateLimit: {
        enabled: process.env.RATE_LIMIT_ENABLED === 'true',
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes default
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
        skipPaths: (
          process.env.RATE_LIMIT_SKIP_PATHS || '/health,/metrics'
        ).split(','),
      },
      apiKey: {
        enabled: process.env.API_KEY_ENABLED === 'true',
        keys: (process.env.API_KEYS || '').split(','),
        excludePaths: (
          process.env.API_KEY_EXCLUDE_PATHS || '/health,/metrics'
        ).split(','),
      },
      ipWhitelist: {
        enabled: process.env.IP_WHITELIST_ENABLED === 'true',
        allowedIps: (process.env.ALLOWED_IPS || '127.0.0.1,::1')
          .split(',')
          .map((ip) => ip.trim()),
        maxFailedAttempts: parseInt(
          process.env.IP_MAX_FAILED_ATTEMPTS || '5',
          10,
        ),
        blockDuration: parseInt(process.env.IP_BLOCK_DURATION || '3600000', 10), // 1 hour default
      },
      payload: {
        maxSize: parseInt(process.env.MAX_PAYLOAD_SIZE || '10485760', 10), // 10MB default
        allowedContentTypes: [
          'application/json',
          'application/x-www-form-urlencoded',
          'multipart/form-data',
        ],
      },
    }),

    // Monitoring Configuration
    MonitoringModule.forRoot({
      serviceName: 'skills-service',
      enabled: process.env.ENABLE_METRICS === 'true',
      sampleRate: parseFloat(process.env.MONITOR_SAMPLE_RATE || '1.0'),
      metrics: {
        http: {
          enabled: true,
          buckets: [0.1, 0.3, 0.5, 0.7, 1, 2, 3, 5, 7, 10],
          excludePaths: (
            process.env.METRICS_EXCLUDE_PATHS || '/health,/metrics'
          ).split(','),
        },
        system: {
          enabled: true,
          collectInterval: parseInt(
            process.env.SYSTEM_METRICS_INTERVAL || '10000',
            10,
          ),
        },
        business: {
          enabled: true,
        },
      },
      tags: {
        environment: process.env.NODE_ENV || 'development',
        version: process.env.APP_VERSION || '1.0.0',
      },
    }),

    RedisModule.forRoot({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT
        ? parseInt(process.env.REDIS_PORT, 10)
        : 6379,
    }),
  ],
})
export class AppModule {}
