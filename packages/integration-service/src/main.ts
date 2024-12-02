import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  HttpExceptionFilter,
  Logger,
  SecurityMiddleware,
  SwaggerHelper,
  TransformInterceptor,
} from '@skills-base/shared';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Setup Swagger documentation
  SwaggerHelper.setup(
    app,
    'Integration API Documentation',
    'swagger', // Access swagger at /swagger
  );
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.use(new SecurityMiddleware().use);
  const logger = new Logger('Bootstrap');

  app.enableCors({
    origin: ['http://localhost:3000', 'https://yourdomain.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });

  const port = process.env.PORT || 3004;
  await app.listen(port);

  logger.info(`Integration service is running on: http://localhost:${port}`);
  logger.info(
    `Swagger documentation is available at: http://localhost:${port}/api`,
  );
}
bootstrap();
