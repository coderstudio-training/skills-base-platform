import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { RateLimitGuard } from '../guards/rate-limit.guard';
import { RateLimitConfig } from '../security.types';

export const RATE_LIMIT_KEY = 'rate-limit';

export function RateLimit(options?: Partial<RateLimitConfig>) {
  return applyDecorators(
    SetMetadata(RATE_LIMIT_KEY, options),
    UseGuards(RateLimitGuard),
  );
}
