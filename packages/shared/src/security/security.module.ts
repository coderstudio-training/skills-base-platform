import { CacheModule } from '@nestjs/cache-manager';
import { DynamicModule, Module, Provider } from '@nestjs/common';
import { SecurityConfigurationManager } from './config/security.config';
import { ApiKeyGuard } from './guards/api-key.guard';
import { IpWhitelistGuard } from './guards/ip.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { SecurityMiddleware } from './middlewares/security.middleware';
import { RateLimiter } from './rate-limit/rate-limiter';
import { SecurityMonitoringService } from './security-monitoring.service';
import { PartialSecurityConfig } from './security.types';
import { RequestValidationMiddleware } from './validators/request.validator';

@Module({})
export class SecurityModule {
  static forRoot(config?: PartialSecurityConfig): DynamicModule {
    const configManager = SecurityConfigurationManager.getInstance();
    if (config) {
      configManager.updateConfig(config);
    }

    const securityConfig = configManager.getConfig();
    const monitoringService = new SecurityMonitoringService();

    const securityConfigProvider: Provider = {
      provide: 'SECURITY_CONFIG',
      useValue: securityConfig,
    };

    const providers: Provider[] = [
      securityConfigProvider,
      {
        provide: SecurityMonitoringService,
        useValue: monitoringService,
      },
      RateLimiter,
      RateLimitGuard,
      ApiKeyGuard,
      IpWhitelistGuard,
      SecurityMiddleware,
      RequestValidationMiddleware,
    ];

    return {
      module: SecurityModule,
      imports: [
        CacheModule.register({
          ttl: securityConfig.rateLimit.windowMs / 1000,
          max: 10000,
        }),
      ],
      providers,
      exports: [...providers, SecurityMonitoringService],
      global: true,
    };
  }
}
