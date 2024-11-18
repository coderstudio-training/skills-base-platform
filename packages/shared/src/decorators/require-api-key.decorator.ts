import { UseGuards, applyDecorators } from '@nestjs/common';
import { ApiKeyGuard } from '../guards/api-key.guard';

export function RequireApiKey() {
  return applyDecorators(UseGuards(ApiKeyGuard));
}
