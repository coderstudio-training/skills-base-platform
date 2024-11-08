import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  DatabaseModule,
  LoggerMiddleware,
  LoggingModule,
  SecurityMiddleware,
  SecurityModule,
  SecurityConfig,
} from '@skills-base/shared';
import { AuthModule } from './auth/auth.module';
import { EmployeesModule } from './employees/employees.module';
import { UsersModule } from './users/users.module';

const securityConfig: SecurityConfig = {
  rateLimit: {
    enabled: true,
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Default limit
    skipPaths: ['/health', '/metrics', '/auth/verify'],
  },
  apiKey: {
    enabled: false,
    keys: [],
    excludePaths: ['/auth/login', '/auth/register', '/auth/google'],
  },
  ipWhitelist: {
    enabled: false,
    allowedIps: [],
  },
  payloadLimit: {
    maxSize: 10 * 1024 * 1024, // 10MB
  },
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SecurityModule.forRoot(securityConfig),
    DatabaseModule,
    UsersModule,
    AuthModule,
    EmployeesModule,
    LoggingModule.forRoot({
      serviceName: 'user-service',
      environment: process.env.NODE_ENV,
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware, SecurityMiddleware).forRoutes('*');
  }
}
