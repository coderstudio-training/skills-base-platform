# Swagger Documentation Implementation Guide

## Standard Swagger Installation

First, navigate to your service directory:

```bash
cd packages/your-service-name
```

Install the required Swagger packages:

```bash
npm install @nestjs/swagger swagger-ui-express
```

For Fastify (if you're using it instead of Express):

```bash
npm install @nestjs/swagger fastify-swagger
```

### Basic Swagger Setup (Standard)

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Your API Title')
    .setDescription('API Description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000);
}
bootstrap();
```

## Prerequisites for Shared Utilities

1. Your service must have `@skills-base/shared` as a dependency:

```json
{
  "dependencies": {
    "@skills-base/shared": "^1.0.0"
  }
}
```

2. Required imports:

```typescript
import { SwaggerHelper } from '@skills-base/shared';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
```

[Rest of the original content remains the same...]
