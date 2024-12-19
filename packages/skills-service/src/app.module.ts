import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  DatabaseModule,
  JwtStrategy,
  LoggingModule,
  MonitoringModule,
  SecurityModule,
} from '@skills-base/shared';
import { AppController } from './app.controller';
import { AssessmentsModule } from './assessments/assessments.module';
import { TaxonomyModule } from './taxonomy/taxonomy.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    TaxonomyModule,
    AssessmentsModule,
    // Configure Logging Module
    LoggingModule.forRoot({
      serviceName: 'skills-service',
      environment: process.env.NODE_ENV,
      enableGlobalInterceptor: true,
      skipPaths: ['/health', '/metrics'], // Optional: paths to skip logging
    }),

    // Configure Security Module
    SecurityModule.forRoot({
      rateLimit: {
        enabled: true,
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // limit each IP to 100 requests per windowMs
      },
      ipWhitelist: {
        enabled: false, // Enable if you want IP whitelisting
        allowedIps: [],
      },
      apiKey: {
        enabled: false, // Enable if you want API keying
      },
      payload: {
        maxSize: 10 * 1024 * 1024, // 10MB
      },
    }),

    // Configure Monitoring Module
    MonitoringModule.forRoot({
      serviceName: 'skills-service',
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
  providers: [JwtStrategy],

  controllers: [AppController],
})
export class AppModule {}
