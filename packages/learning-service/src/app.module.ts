import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  JwtStrategy,
  LoggingModule,
  MonitoringModule,
  SecurityModule,
} from '@skills-base/shared';
import { AppController } from './app.controller';
import { CoursesController } from './courses/controllers/courses.controller';
import { RecommendationController } from './courses/controllers/recommendation.controller';
import { CoursesService } from './courses/services/courses.service';
import { RecommendationService } from './courses/services/recommendation.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Primary MongoDB connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    // Skills MongoDB connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_SKILLS_URI'),
      }),
      inject: [ConfigService],
      connectionName: 'MONGODB_SKILLS_URI',
    }),
    // Configure Logging Module
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
        max: 1000, // limit each IP to 100 requests per windowMs
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
  controllers: [CoursesController, RecommendationController, AppController],
  providers: [CoursesService, RecommendationService, JwtStrategy],
})
export class AppModule {}
