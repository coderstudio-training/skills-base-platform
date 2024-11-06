import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RATE_LIMIT_KEY } from '../decorators/rate-limit.decorator';
import { RateLimiter } from '../rate-limit/rate-limiter';
import { RateLimitConfig } from '../types';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rateLimiter: RateLimiter,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const routeConfig = this.reflector.getAllAndOverride<
      Partial<RateLimitConfig>
    >(RATE_LIMIT_KEY, [context.getHandler(), context.getClass()]);

    // Merge route-specific config with global config
    const config = {
      ...this.rateLimiter.getConfig(),
      ...routeConfig,
    };

    return this.rateLimiter.handleRequest(request, config);
  }
}
