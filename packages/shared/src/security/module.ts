import { CacheModule } from '@nestjs/cache-manager';
import { DynamicModule, Module } from '@nestjs/common';
import { ApiKeyGuard } from './guards/api-key.guard';
import { IpWhitelistGuard } from './guards/ip.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { SecurityMiddleware } from './middlewares/security.middleware';
import { SecurityMonitor } from './monitoring';
import { RateLimiter } from './rate-limit/rate-limiter';
import { SecurityConfig } from './types';
import { RequestValidator } from './validators/request.validator';

@Module({})
export class SecurityModule {
  static forRoot(config: SecurityConfig): DynamicModule {
    return {
      module: SecurityModule,
      imports: [
        CacheModule.register({
          ttl: Math.max(config.rateLimit.windowMs / 1000, 5), // Convert to seconds, minimum 5 seconds
          max: 10000, // Maximum number of items in cache
        }),
      ],
      providers: [
        {
          provide: 'SECURITY_CONFIG',
          useValue: config,
        },
        RateLimiter,
        RateLimitGuard,
        ApiKeyGuard,
        IpWhitelistGuard,
        SecurityMiddleware,
        SecurityMonitor,
        RequestValidator,
      ],
      exports: [
        RateLimiter,
        RateLimitGuard,
        ApiKeyGuard,
        IpWhitelistGuard,
        SecurityMiddleware,
        SecurityMonitor,
        RequestValidator,
      ],
    };
  }
}
