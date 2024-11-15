import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggingModule, MonitoringModule } from '@skills-base/shared';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggingModule.forRoot({
      serviceName: 'email_service',
      environment: process.env.NODE_ENV || 'development',
    }),
    MonitoringModule.forRoot({
      serviceName: 'email_service',
      enabled: true,
      sampleRate: 1,
      customBuckets: {
        http: [0.1, 0.3, 0.5, 0.7, 1, 2, 3, 5, 7, 10],
        operation: [0.01, 0.05, 0.1, 0.5, 1, 2.5, 5, 10],
      },
      tags: {
        environment: process.env.NODE_ENV || 'development',
        version: process.env.APP_VERSION || '1.0.0',
      },
    }),
    EmailModule,
  ],
})
export class AppModule {}
