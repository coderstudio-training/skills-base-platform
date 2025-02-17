import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  HttpExceptionFilter,
  SecurityMiddleware,
  SwaggerHelper,
  TransformInterceptor,
} from '@skills-base/shared';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Body parser configuration for handling large requests
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  // Global pipes and filters
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  // Apply global middleware
  app.use(new SecurityMiddleware().use);

  const corsOrigins = process.env.CORS_ORIGINS?.split(',') || [];

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });

  // Setup Swagger documentation
  SwaggerHelper.setup(
    app,
    'Skills API Documentation',
    'swagger', // Access swagger at /swagger
  );

  // Start server
  const port = process.env.PORT || 3000;
  await app.listen(port);

  Logger.log(
    `Skills service is running on: http://localhost:${port}`,
    'Bootstrap',
  );
  Logger.log(
    `Swagger documentation is available at: http://localhost:${port}/swagger`,
    'Bootstrap',
  );
}

bootstrap();
