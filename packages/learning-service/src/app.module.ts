import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  DatabaseModule,
  JwtStrategy,
  LoggingModule,
  MonitoringModule,
  SecurityModule,
} from '@skills-base/shared';
import { CoursesController } from './courses/controllers/courses.controller';
import { RecommendationController } from './courses/controllers/recommendation.controller';
import { CoursesService } from './courses/services/courses.service';
import { RecommendationService } from './courses/services/recommendation.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    LoggingModule.forRoot({
      serviceName: 'learning-service',
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
      serviceName: 'learning-service',
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
  controllers: [CoursesController, RecommendationController],
  providers: [CoursesService, RecommendationService, JwtStrategy],
})
export class AppModule {}
