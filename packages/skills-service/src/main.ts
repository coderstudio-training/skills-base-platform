import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter, TransformInterceptor } from '@skills-base/shared';
import * as bodyParser from 'body-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Body parser configuration for handling large requests
  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

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

  // CORS configuration
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3002'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });

  // Security middleware
  app.use(helmet());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Skills Assessment API')
    .setDescription(
      `
    REST API for managing employee skills assessments and analytics.
    Also includes the skills taxonomy, serving as reference for evaluation
    and assessments.

    This API provides endpoints for:
    - Managing skill assessments (self and manager assessments)
    - Calculating skill gaps and performance metrics
    - Generating skills analytics and distributions
    - Managing employee skill matrices and rankings
    - Managing skills taxonomy

    Authentication is required for all endpoints using JWT Bearer tokens.
    Different endpoints require different role permissions (USER, MANAGER, ADMIN).
    `,
    )
    .setVersion('1.0')
    .addTag('Skills Assessments', 'Endpoints for managing skill assessments')
    .addTag('Skill Matrix', 'Endpoints for skill matrix and employee rankings')
    .addTag('Taxonomy', 'Endpoints for technical skills taxonomy')
    // JWT Bearer Auth
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token',
      },
      'JWT-auth',
    )
    // Google OAuth2 Auth
    .addOAuth2(
      {
        type: 'oauth2',
        flows: {
          authorizationCode: {
            authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
            tokenUrl: 'https://oauth2.googleapis.com/token',
            scopes: {
              openid: 'OpenID Connect',
              email: 'Access email address',
              profile: 'Access profile information',
            },
          },
        },
        description: 'Use Google OAuth2 for authentication.',
      },
      'google-oauth2', // This is the name of the OAuth2 scheme
    )
    .addServer('http://localhost:3002', 'Local Development')
    .addServer('https://yourdomain.com', 'Production')
    .setContact('Your Team', 'https://yourdomain.com', 'team@yourdomain.com')
    .setLicense('Private', 'https://yourdomain.com/license')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      filter: true,
      tryItOutEnabled: true,
      customSiteTitle: 'Skills Assessment API Documentation',
      customfavIcon: 'https://yourdomain.com/favicon.ico',
    },
    customCss: '.swagger-ui .topbar { display: none }',
    customJs: '/custom.js',
  });

  // Start server
  const port = process.env.PORT || 3000;
  await app.listen(port);

  Logger.log(
    `Skills service is running on: http://localhost:${port}`,
    'Bootstrap',
  );
  Logger.log(
    `Swagger documentation is available at: http://localhost:${port}/api-docs`,
    'Bootstrap',
  );
}

bootstrap();
