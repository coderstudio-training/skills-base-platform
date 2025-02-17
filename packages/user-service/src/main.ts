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
    '/swagger', // Access swagger at /swagger
  );

  const corsOrigins = process.env.CORS_ORIGINS?.split(',') || [];

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          styleSrc: [`'self'`, `'unsafe-inline'`],
          imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
        },
      },
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.info(`User service is running on: http://localhost:${port}`);
}
bootstrap();
