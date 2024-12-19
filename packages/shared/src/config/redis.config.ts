import { RedisConfig } from '../interfaces/redis.interface';
import { createDevelopmentConfig } from './redis.environment.ts/development.config';

export class RedisConfigurationManager {
  private static instance: RedisConfigurationManager;
  private config: RedisConfig;
  private environmentConfigs: Record<string, Partial<RedisConfig>> = {};
  private envConfigMap: Record<
    string,
    (env: string, appVersion: string) => RedisConfig
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

  static getInstance(): RedisConfigurationManager {
    if (!RedisConfigurationManager.instance) {
      RedisConfigurationManager.instance = new RedisConfigurationManager();
    }
    return RedisConfigurationManager.instance;
  }

  setEnvironmentConfigs(configs: Record<string, Partial<RedisConfig>>) {
    this.environmentConfigs = configs;
    this.config = this.loadConfiguration();
  }

  private loadConfiguration(): RedisConfig {
    const env = process.env.NODE_ENV || 'development';
    const appVersion = process.env.APP_VERSION || '1.0.0';

    const configCreator =
      this.envConfigMap[env] || this.envConfigMap.development;
    if (!configCreator) {
      throw new Error(`No Redis configuration found for environment: ${env}`);
    }

    const envConfig = configCreator(env, appVersion);
    const envOverrides = this.environmentConfigs[env] || {};
    const customConfig = this.loadCustomConfig();

    return {
      host: customConfig.host || envOverrides.host || envConfig.host,
      port: customConfig.port || envOverrides.port || envConfig.port,
      password:
        customConfig.password || envOverrides.password || envConfig.password,
      db: customConfig.db || envOverrides.db || envConfig.db,
      keyPrefix:
        customConfig.keyPrefix || envOverrides.keyPrefix || envConfig.keyPrefix,
      ttl: customConfig.ttl || envOverrides.ttl || envConfig.ttl,
      retryAttempts:
        customConfig.retryAttempts ||
        envOverrides.retryAttempts ||
        envConfig.retryAttempts,
      retryDelay:
        customConfig.retryDelay ||
        envOverrides.retryDelay ||
        envConfig.retryDelay,
    };
  }

  private loadCustomConfig(): Partial<RedisConfig> {
    return {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
        ? parseInt(process.env.REDIS_PORT, 10)
        : undefined,
      password: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB, 10) : undefined,
      keyPrefix: process.env.REDIS_KEY_PREFIX,
      ttl: process.env.REDIS_TTL
        ? parseInt(process.env.REDIS_TTL, 10)
        : undefined,
      retryAttempts: process.env.REDIS_RETRY_ATTEMPTS
        ? parseInt(process.env.REDIS_RETRY_ATTEMPTS, 10)
        : undefined,
      retryDelay: process.env.REDIS_RETRY_DELAY
        ? parseInt(process.env.REDIS_RETRY_DELAY, 10)
        : undefined,
    };
  }

  getConfig(): RedisConfig {
    return this.config;
  }

  updateConfig(updates: Partial<RedisConfig>) {
    this.config = {
      ...this.config,
      ...updates,
    };
  }
}
