// src/decorators/validate.decorator.ts
import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { ValidateInterceptor } from '../interceptors/validate.interceptor';

export function Validate(schema: any) {
  return applyDecorators(UseInterceptors(new ValidateInterceptor(schema)));
}
