import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { RateLimitGuard } from '../guards/rate-limit.guard';
import { RouteRateLimitConfig } from '../interfaces/security.interfaces';

export const RATE_LIMIT_KEY = 'rate-limit';

export function RateLimit(options?: Partial<RouteRateLimitConfig>) {
  return applyDecorators(
    SetMetadata(RATE_LIMIT_KEY, options),
    UseGuards(RateLimitGuard),
  );
}
