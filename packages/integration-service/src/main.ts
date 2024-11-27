import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter, TransformInterceptor } from '@skills-base/shared';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Integration Service API')
    .setDescription('API documentation for the Integration Service')
    .setVersion('1.0')
    .addTag('workflows')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  app.enableCors({
    origin: ['http://localhost:3000', 'https://yourdomain.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });
  app.use(helmet());

  const port = process.env.PORT || 3004;
  await app.listen(port);

  Logger.log(
    `Integration service is running on: http://localhost:${port}`,
    'Bootstrap',
  );
  Logger.log(
    `Swagger documentation is available at: http://localhost:${port}/api`,
    'Bootstrap',
  );
}
bootstrap();
