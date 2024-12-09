import { CacheModule } from '@nestjs/cache-manager';
import { DynamicModule, Module, Provider } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { SecurityConfigurationManager } from '../config/security.config';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { IpWhitelistGuard } from '../guards/ip.guard';
import { RateLimitGuard } from '../guards/rate-limit.guard';
import {
  PartialSecurityConfig,
  SecurityConfig,
} from '../interfaces/security.interfaces';
import { SecurityMiddleware } from '../middlewares/security.middleware';
import { SecurityMonitoringService } from '../services/security-monitoring.service';

@Module({})
export class SecurityModule {
  static forRoot(config?: PartialSecurityConfig): DynamicModule {
    const configManager = SecurityConfigurationManager.getInstance();
    if (config) {
      configManager.updateConfig(config);
    }
    const securityConfig = configManager.getConfig();

    // Base providers that are always included
    const providers: Provider[] = [
      {
        provide: 'SECURITY_CONFIG',
        useValue: securityConfig,
      },
      SecurityMonitoringService,
      SecurityMiddleware,
    ];

    // Initialize core cache module
    const cacheModule = CacheModule.register({
      ttl: Math.ceil(securityConfig.rateLimit.windowMs / 1000), // Sync with rate limit window
      max: 10000,
      isGlobal: true,
      store: 'memory',
    });

    const guards = this.getEnabledGuards(securityConfig);
    providers.push(...guards);

    return {
      module: SecurityModule,
      imports: [cacheModule],
      providers,
      exports: [
        'SECURITY_CONFIG',
        SecurityMonitoringService,
        SecurityMiddleware,
        cacheModule,
      ],
      global: true,
    };
  }

  private static getEnabledGuards(config: SecurityConfig): Provider[] {
    const guards: Provider[] = [];

    // Rate Limiting
    if (config.rateLimit.enabled) {
      guards.push({
        provide: APP_GUARD,
        useClass: RateLimitGuard,
      });
    }

    // API Key Authentication
    if (config.apiKey.enabled) {
      guards.push({
        provide: APP_GUARD,
        useClass: ApiKeyGuard,
      });
    }

    // IP Whitelist Protection
    if (config.ipWhitelist.enabled) {
      guards.push({
        provide: APP_GUARD,
        useClass: IpWhitelistGuard,
      });
    }

    return guards;
  }
}
