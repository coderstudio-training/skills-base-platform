import { CacheModule } from '@nestjs/cache-manager';
import { DynamicModule, Module, Provider } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { SecurityConfigurationManager } from '../config/security.config';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { IpWhitelistGuard } from '../guards/ip.guard';
import { RateLimitGuard } from '../guards/rate-limit.guard';
import { PartialSecurityConfig } from '../interfaces/security.interfaces';
import { SecurityMiddleware } from '../middlewares/security.middleware';
import { RateLimiter } from '../services/rate-limiter.service';
import { SecurityMonitoringService } from '../services/security-monitoring.service';
import { SecurityValidationMiddleware } from '../validators/security.validator';

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
      {
        provide: APP_GUARD,
        useClass: ApiKeyGuard,
      },
      {
        provide: APP_GUARD,
        useClass: RateLimitGuard,
      },
      {
        provide: APP_GUARD,
        useClass: IpWhitelistGuard,
      },
      SecurityMiddleware,
      SecurityValidationMiddleware,
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
