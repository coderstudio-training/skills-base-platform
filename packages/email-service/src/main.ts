// src/main.ts
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { HttpExceptionFilter, TransformInterceptor } from '@skills-base/shared';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Update CORS configuration to include Grafana's origin
  app.enableCors({
    origin: [
      'http://localhost:3005',
      'http://localhost:3000', // Assuming Grafana runs on default port
      'https://yourdomain.com',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });

  app.use(helmet());

  const port = process.env.PORT || 3005;
  await app.listen(port);

  logger.log(`Email service is running on: http://localhost:${port}`);
}
bootstrap();
