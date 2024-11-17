import { CacheModule } from '@nestjs/cache-manager';
import { DynamicModule, Module, Provider } from '@nestjs/common';
import { SecurityConfigurationManager } from './config/security.config';
import { RateLimit } from './decorators/rate-limit.decorator';
import { RequireApiKey } from './decorators/require-api-key.decorator';
import { ApiKeyGuard } from './guards/api-key.guard';
import { IpWhitelistGuard } from './guards/ip.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { SecurityMiddleware } from './middlewares/security.middleware';
import { RateLimiter } from './rate-limit/rate-limiter';
import { SecurityMonitoringService } from './security-monitoring.service';
import { PartialSecurityConfig } from './types';
import { RequestValidationMiddleware } from './validators/request.validator';

@Module({})
export class SecurityModule {
  static forRoot(config?: PartialSecurityConfig): DynamicModule {
    const configManager = SecurityConfigurationManager.getInstance();
    if (config) {
      configManager.updateConfig(config);
    }

    const securityConfigProvider: Provider = {
      provide: 'SECURITY_CONFIG',
      useValue: configManager.getConfig(),
    };

    return {
      module: SecurityModule,
      imports: [
        CacheModule.register({
          ttl: configManager.getConfig().rateLimit.windowMs / 1000, // Convert to seconds
          max: 10000, // Maximum number of items in cache
        }),
      ],
      providers: [
        securityConfigProvider,
        SecurityMonitoringService,
        RateLimiter,
        RateLimitGuard,
        ApiKeyGuard,
        IpWhitelistGuard,
        SecurityMiddleware,
        RequestValidationMiddleware,
      ],
      exports: [
        securityConfigProvider,
        SecurityMonitoringService,
        RateLimiter,
        RateLimitGuard,
        ApiKeyGuard,
        IpWhitelistGuard,
        SecurityMiddleware,
        RequestValidationMiddleware,
        RateLimit,
        RequireApiKey,
      ],
      global: true, // Make the module global so its exports are available everywhere
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: SecurityModule,
      imports: [SecurityModule.forRoot()],
    };
  }
}
