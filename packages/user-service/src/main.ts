// packages/user-service/src/main.ts

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  HttpExceptionFilter,
  Logger,
  SecurityMiddleware,
  SwaggerHelper,
  TransformInterceptor,
} from '@skills-base/shared';
import { json } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '10mb' }));

  app.useGlobalInterceptors(new TransformInterceptor());

  // Initialize logger
  const logger = new Logger('Bootstrap');

  // Apply global middleware
  app.use(new SecurityMiddleware().use);

  // Apply global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Apply global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Setup Swagger documentation
  SwaggerHelper.setup(
    app,
    'User API Documentation',
    'swagger', // Access swagger at /swagger
  );

  app.enableCors({
    origin: ['http://localhost:3000', 'https://yourdomain.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });
  app.use(helmet());

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.logger(
    `User service is running on: http://localhost:${port}`,
    'Bootstrap',
  );
}
bootstrap();
