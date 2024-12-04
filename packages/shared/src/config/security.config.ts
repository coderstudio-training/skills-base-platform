import {
  PartialSecurityConfig,
  SecurityConfig,
} from '../interfaces/security.interfaces';
import { createDevelopmentConfig } from './security.environments/development.config';

// config/security.config.ts
export class SecurityConfigurationManager {
  private static instance: SecurityConfigurationManager;
  private config: SecurityConfig;
  private environmentConfigs: Record<string, PartialSecurityConfig> = {};
  private envConfigMap: Record<
    string,
    (env: string, appVersion: string) => SecurityConfig
  > = {};

  private constructor() {
    this.registerEnvironmentConfigs();
    this.config = this.loadConfiguration();
  }

  private registerEnvironmentConfigs() {
    this.envConfigMap = {
      development: createDevelopmentConfig,
    };
  }

  static getInstance(): SecurityConfigurationManager {
    if (!SecurityConfigurationManager.instance) {
      SecurityConfigurationManager.instance =
        new SecurityConfigurationManager();
    }
    return SecurityConfigurationManager.instance;
  }

  setEnvironmentConfigs(configs: Record<string, PartialSecurityConfig>) {
    this.environmentConfigs = configs;
    this.config = this.loadConfiguration();
  }

  private loadConfiguration(): SecurityConfig {
    const env = process.env.NODE_ENV || 'development';
    const appVersion = process.env.APP_VERSION || '1.0.0';

    const configCreator =
      this.envConfigMap[env] || this.envConfigMap.development;
    if (!configCreator) {
      throw new Error(
        `No security configuration found for environment: ${env}`,
      );
    }

    const envConfig = configCreator(env, appVersion);
    const envOverrides = this.environmentConfigs[env] || {};
    const customConfig = this.loadCustomConfig();

    return {
      rateLimit: {
        ...envConfig.rateLimit,
        ...envOverrides.rateLimit,
        ...customConfig.rateLimit,
      },
      apiKey: {
        ...envConfig.apiKey,
        ...envOverrides.apiKey,
        ...customConfig.apiKey,
      },
      ipWhitelist: {
        ...envConfig.ipWhitelist,
        ...envOverrides.ipWhitelist,
        ...customConfig.ipWhitelist,
      },
      payload: {
        ...envConfig.payload,
        ...envOverrides.payload,
        ...customConfig.payload,
      },
      bruteForce: {
        ...envConfig.bruteForce,
        ...envOverrides.bruteForce,
        ...customConfig.bruteForce,
      },
    };
  }

  private loadCustomConfig(): PartialSecurityConfig {
    return {
      rateLimit: {
        ...(process.env.RATE_LIMIT_ENABLED && {
          enabled: process.env.RATE_LIMIT_ENABLED === 'true',
        }),
        ...(process.env.RATE_LIMIT_WINDOW && {
          windowMs: parseInt(process.env.RATE_LIMIT_WINDOW, 10),
        }),
        ...(process.env.RATE_LIMIT_MAX && {
          max: parseInt(process.env.RATE_LIMIT_MAX, 10),
        }),
        ...(process.env.RATE_LIMIT_SKIP_PATHS && {
          skipPaths: process.env.RATE_LIMIT_SKIP_PATHS.split(','),
        }),
      },
      apiKey: {
        ...(process.env.API_KEY_ENABLED && {
          enabled: process.env.API_KEY_ENABLED === 'true',
        }),
        ...(process.env.API_KEYS && {
          keys: process.env.API_KEYS.split(','),
        }),
      },
      ipWhitelist: {
        ...(process.env.IP_WHITELIST_ENABLED && {
          enabled: process.env.IP_WHITELIST_ENABLED === 'true',
        }),
        ...(process.env.ALLOWED_IPS && {
          allowedIps: process.env.ALLOWED_IPS.split(','),
        }),
      },
      payload: {
        ...(process.env.MAX_PAYLOAD_SIZE && {
          maxSize: parseInt(process.env.MAX_PAYLOAD_SIZE, 10),
        }),
      },
    };
  }

  getConfig(): SecurityConfig {
    return this.config;
  }

  updateConfig(updates: PartialSecurityConfig) {
    this.config = {
      ...this.config,
      rateLimit: {
        ...this.config.rateLimit,
        ...updates.rateLimit,
      },
      apiKey: {
        ...this.config.apiKey,
        ...updates.apiKey,
      },
      ipWhitelist: {
        ...this.config.ipWhitelist,
        ...updates.ipWhitelist,
      },
      payload: {
        ...this.config.payload,
        ...updates.payload,
      },
    };
  }
}
