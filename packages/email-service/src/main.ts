import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const port = process.env.PORT || 3005;
  app.enableCors();
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
