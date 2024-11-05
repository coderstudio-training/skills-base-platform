import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';

export class GlobalValidationPipe extends ValidationPipe {
  constructor(options: ValidationPipeOptions = {}) {
    super({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      ...options,
    });
  }
}
