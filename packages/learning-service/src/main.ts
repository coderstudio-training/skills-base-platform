import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Learning Service API')
    .setDescription(
      `
      API for managing learning resources and course recommendations.
      
      Authentication:
      - Admin endpoints: Use JWT token from admin login
      - Staff/Manager endpoints: Use Google OAuth token (from frontend)
      
      Note: For testing in Swagger UI:
      1. Admin access: Get JWT token from /auth/login endpoint
      2. Staff/Manager access: This requires Google OAuth authentication from the frontend
    `,
    )
    .setVersion('1.0')
    .addTag('Courses', 'Learning resources and course management endpoints')
    .addTag('Learning', 'Course recommendations and learning path endpoints')
    // Add JWT auth
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter admin JWT token here',
      },
      'JWT-auth',
    )
    // Add OAuth
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [
      /* your models here */
    ],
  });

  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });

  const port = process.env.PORT || 3003;
  await app.listen(port);
}
bootstrap();
