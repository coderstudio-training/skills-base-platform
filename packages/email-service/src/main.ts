import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  HttpExceptionFilter,
  Logger,
  SwaggerHelper,
  TransformInterceptor,
} from '@skills-base/shared';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global pipes and filters
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());

  // Create logger and metrics service instances
  const logger = new Logger('bootstrap');

  // Global interceptors for monitoring and logging
  app.useGlobalInterceptors(new TransformInterceptor());

  // CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:3005',
      'http://localhost:3000',
      'https://yourdomain.com',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });

  SwaggerHelper.setup(app, 'Email Service API', 'swagger');

  // Security middleware
  app.use(helmet());

  const port = process.env.PORT || 3005;
  await app.listen(port);

  logger.info(`Email service is running on: http://localhost:${port}`);
  logger.info(
    `Metrics endpoint available at: http://localhost:${port}/metrics`,
  );
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start application', { error });
  process.exit(1);
});
