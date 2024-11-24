// src/main.ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  HttpExceptionFilter,
  Logger,
  SwaggerHelper,
  TransformInterceptor,
} from '@skills-base/shared';
import { json } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create the app
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Setup basic security
  app.use(helmet());
  app.use(json({ limit: '10mb' }));

  // Create logger and metrics service instances
  const logger = new Logger('user-service-main');

  // Global pipes and filters
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors with their required dependencies
  app.useGlobalInterceptors(new TransformInterceptor());

  // CORS configuration
  app.enableCors({
    origin: ['http://localhost:3000', 'https://yourdomain.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });

  SwaggerHelper.setup(app, 'User Service API', 'swagger');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.info(`User service is running on: http://localhost:${port}`);
  logger.info(`Metrics available on: http://localhost:${port}/metrics`);
}
bootstrap();
