// packages/shared/src/security/module.ts
import { CacheModule } from '@nestjs/cache-manager';
import { DynamicModule, Module, Provider } from '@nestjs/common';
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
    const securityConfigProvider: Provider = {
      provide: 'SECURITY_CONFIG',
      useValue: config,
    };

    return {
      module: SecurityModule,
      global: true,
      imports: [
        CacheModule.register({
          isGlobal: true,
          ttl: Math.max(config.rateLimit.windowMs / 1000, 5),
          max: 10000,
        }),
      ],
      providers: [
        securityConfigProvider,
        {
          provide: ApiKeyGuard,
          useFactory: (config: SecurityConfig) => new ApiKeyGuard(config),
          inject: ['SECURITY_CONFIG'],
        },
        {
          provide: IpWhitelistGuard,
          useFactory: (config: SecurityConfig) => new IpWhitelistGuard(config),
          inject: ['SECURITY_CONFIG'],
        },
        RateLimiter,
        RateLimitGuard,
        SecurityMiddleware,
        SecurityMonitor,
        RequestValidator,
      ],
      exports: [
        securityConfigProvider,
        RateLimiter,
        RateLimitGuard,
        ApiKeyGuard,
        IpWhitelistGuard,
        SecurityMiddleware,
        SecurityMonitor,
        RequestValidator,
        CacheModule,
      ],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: SecurityModule,
      imports: [
        CacheModule.register({
          ttl: 5,
          max: 10000,
        }),
      ],
      providers: [RateLimiter, RateLimitGuard, SecurityMonitor],
      exports: [RateLimiter, RateLimitGuard, SecurityMonitor],
    };
  }
}
