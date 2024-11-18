import {
  ErrorTrackerConfig,
  LoggingConfig,
  LogLevel,
  WinstonLoggerConfig,
} from '../interfaces/logging.interfaces';
import { createDevelopmentConfig } from './logging.environments.ts/development.config';
import { createProductionConfig } from './logging.environments.ts/production.config';
import { createStagingConfig } from './logging.environments.ts/staging.config';
import { createTestConfig } from './logging.environments.ts/test.config';

export class ConfigurationManager {
  private static instance: ConfigurationManager;
  private config: LoggingConfig;
  private environmentConfigs: Record<string, Partial<LoggingConfig>> = {};
  private envConfigMap: Record<
    string,
    (env: string, appVersion: string) => LoggingConfig
  > = {};

  private constructor() {
    this.registerEnvironmentConfigs();
    this.config = this.loadConfiguration();
  }

  private registerEnvironmentConfigs() {
    this.envConfigMap = {
      production: createProductionConfig,
      development: createDevelopmentConfig,
      staging: createStagingConfig,
      test: createTestConfig,
    };
  }

  static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  setEnvironmentConfigs(configs: Record<string, Partial<LoggingConfig>>) {
    this.environmentConfigs = configs;
    this.config = this.loadConfiguration(); // Reload with new configs
  }

  private loadConfiguration() {
    const env = process.env.NODE_ENV || 'development';
    const appVersion = process.env.APP_VERSION || '1.0.0';

    // Get base environment config
    const configCreator =
      this.envConfigMap[env] || this.envConfigMap.development;

    if (!configCreator) {
      throw new Error(`No configuration found for environment: ${env}`);
    }

    const envConfig = configCreator(env, appVersion);

    // Apply any environment-specific overrides
    const envOverrides = this.environmentConfigs[env] || {};

    // Apply custom config from environment variables
    const customConfig = this.loadCustomConfig();

    // Merge configurations with priority: envConfig < envOverrides < customConfig
    return {
      logger: {
        ...envConfig.logger,
        ...envOverrides.logger,
        ...customConfig.logger,
      },
      errorTracker: {
        ...envConfig.errorTracker,
        ...envOverrides.errorTracker,
        ...customConfig.errorTracker,
      },
    };
  }

  private loadCustomConfig() {
    return {
      logger: {
        ...(process.env.LOG_LEVEL && {
          level: process.env.LOG_LEVEL as LogLevel,
        }),
        ...(process.env.LOG_FORMAT && {
          format: process.env.LOG_FORMAT as 'json' | 'text',
        }),
        ...(process.env.LOG_OUTPUTS && {
          outputs: process.env.LOG_OUTPUTS.split(',') as (
            | 'console'
            | 'file'
            | 'loki'
          )[],
        }),
      },
      errorTracker: {},
    };
  }

  getLoggerConfig(): WinstonLoggerConfig {
    return this.config.logger;
  }

  getErrorTrackerConfig(): ErrorTrackerConfig {
    return this.config.errorTracker;
  }

  updateConfig(
    updates: Partial<{
      logger: Partial<WinstonLoggerConfig>;
      errorTracker: Partial<ErrorTrackerConfig>;
    }>,
  ) {
    this.config = {
      logger: { ...this.config.logger, ...updates.logger },
      errorTracker: { ...this.config.errorTracker, ...updates.errorTracker },
    };
  }
}
