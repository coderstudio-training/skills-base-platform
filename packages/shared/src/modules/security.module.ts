import { CacheModule } from '@nestjs/cache-manager';
import { DynamicModule, Module, Provider } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { BruteForceGuard } from 'src/guards/brute-force.guard';
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

    const securityConfigProvider: Provider = {
      provide: 'SECURITY_CONFIG',
      useValue: securityConfig,
    };

    // Configure cache with longer TTL
    const cacheModule = CacheModule.register({
      ttl: Math.max(securityConfig.rateLimit.windowMs / 1000, 300), // At least 5 minutes
      max: 10000,
      isGlobal: true,
    });

    const providers: Provider[] = [
      securityConfigProvider,
      SecurityMonitoringService,
      RateLimiter,
      RateLimitGuard,
      {
        provide: APP_GUARD,
        useClass: RateLimitGuard,
      },
      BruteForceGuard,
      SecurityMiddleware,
      SecurityValidationMiddleware,
    ];

    // Only add API Key guard if enabled
    if (securityConfig.apiKey.enabled) {
      providers.push({
        provide: APP_GUARD,
        useClass: ApiKeyGuard,
      });
    }

    // Only add IP Whitelist guard if enabled
    if (securityConfig.ipWhitelist.enabled) {
      providers.push({
        provide: APP_GUARD,
        useClass: IpWhitelistGuard,
      });
    }

    return {
      module: SecurityModule,
      imports: [cacheModule],
      providers,
      exports: [
        cacheModule,
        securityConfigProvider,
        SecurityMonitoringService,
        RateLimiter,
        RateLimitGuard,
        BruteForceGuard,
        SecurityMiddleware,
        SecurityValidationMiddleware,
      ],
      global: true,
    };
  }
}
