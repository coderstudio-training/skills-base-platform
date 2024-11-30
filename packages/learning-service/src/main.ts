import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  HttpExceptionFilter,
  Logger,
  SecurityMiddleware,
  SwaggerHelper,
} from '@skills-base/shared';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Setup Swagger documentation
  SwaggerHelper.setup(
    app,
    'Learning API Documentation',
    'swagger', // Access swagger at /swagger
  );

  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });

  const port = process.env.PORT || 3003;
  await app.listen(port);
  logger.info(`Application is running on: http://localhost:${port}`);
}
bootstrap();
