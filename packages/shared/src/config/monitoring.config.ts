import {
  BusinessMetricsConfig,
  CompleteMonitoringConfig,
  HttpMetricsConfig,
  MonitoringConfig,
  SystemMetricsConfig,
} from '../interfaces/monitoring.interfaces';
import { createDevelopmentConfig } from './monitoring.environments/development.config';

export class MonitoringConfigurationManager {
  private static instance: MonitoringConfigurationManager;
  private config: CompleteMonitoringConfig;

  private readonly defaultConfig: CompleteMonitoringConfig = {
    serviceName: 'app',
    enabled: true,
    sampleRate: 1,
    metrics: {
      http: {
        enabled: true,
        buckets: [0.1, 0.3, 0.5, 0.7, 1, 2, 3, 5, 7, 10],
        excludePaths: [],
      },
      system: {
        enabled: true,
        collectInterval: 10000,
      },
      business: {
        enabled: true,
      },
    },
    tags: {},
  };

  private constructor() {
    this.registerEnvironmentConfigs();
    this.config = this.loadConfiguration();
  }

  private mergeHttpConfig(
    base: CompleteMonitoringConfig['metrics']['http'],
    update?: Partial<HttpMetricsConfig>,
  ): CompleteMonitoringConfig['metrics']['http'] {
    return {
      enabled: update?.enabled ?? base.enabled,
      buckets: update?.buckets ?? base.buckets,
      excludePaths: update?.excludePaths ?? base.excludePaths,
    };
  }

  private mergeSystemConfig(
    base: CompleteMonitoringConfig['metrics']['system'],
    update?: Partial<SystemMetricsConfig>,
  ): CompleteMonitoringConfig['metrics']['system'] {
    return {
      enabled: update?.enabled ?? base.enabled,
      collectInterval: update?.collectInterval ?? base.collectInterval,
    };
  }

  private mergeBusinessConfig(
    base: CompleteMonitoringConfig['metrics']['business'],
    update?: Partial<BusinessMetricsConfig>,
  ): CompleteMonitoringConfig['metrics']['business'] {
    return {
      enabled: update?.enabled ?? base.enabled,
    };
  }

  private mergeMetricsConfig(
    base: CompleteMonitoringConfig['metrics'],
    update?: MonitoringConfig['metrics'],
  ): CompleteMonitoringConfig['metrics'] {
    return {
      http: this.mergeHttpConfig(base.http, update?.http),
      system: this.mergeSystemConfig(base.system, update?.system),
      business: this.mergeBusinessConfig(base.business, update?.business),
    };
  }

  private mergeConfigs(
    base: CompleteMonitoringConfig,
    update?: MonitoringConfig,
  ): CompleteMonitoringConfig {
    if (!update) return base;

    return {
      serviceName: update.serviceName ?? base.serviceName,
      enabled: update.enabled ?? base.enabled,
      sampleRate: update.sampleRate ?? base.sampleRate,
      metrics: this.mergeMetricsConfig(base.metrics, update.metrics),
      tags: update.tags ? { ...base.tags, ...update.tags } : base.tags,
    };
  }

  private loadCustomConfig(): MonitoringConfig {
    const customConfig: MonitoringConfig = {};
    let metrics: MonitoringConfig['metrics'];

    // Basic configuration
    if (process.env.SERVICE_NAME) {
      customConfig.serviceName = process.env.SERVICE_NAME;
    }
    if (process.env.METRICS_ENABLED !== undefined) {
      customConfig.enabled = process.env.METRICS_ENABLED === 'true';
    }
    if (process.env.METRICS_SAMPLE_RATE) {
      customConfig.sampleRate = parseFloat(process.env.METRICS_SAMPLE_RATE);
    }

    // HTTP Metrics
    if (
      process.env.HTTP_METRICS_ENABLED !== undefined ||
      process.env.METRICS_HTTP_BUCKETS ||
      process.env.METRICS_EXCLUDE_PATHS
    ) {
      metrics = metrics || {};
      metrics.http = {};

      if (process.env.HTTP_METRICS_ENABLED !== undefined) {
        metrics.http.enabled = process.env.HTTP_METRICS_ENABLED === 'true';
      }
      if (process.env.METRICS_HTTP_BUCKETS) {
        metrics.http.buckets =
          process.env.METRICS_HTTP_BUCKETS.split(',').map(Number);
      }
      if (process.env.METRICS_EXCLUDE_PATHS) {
        metrics.http.excludePaths =
          process.env.METRICS_EXCLUDE_PATHS.split(',');
      }
    }

    // System Metrics
    if (
      process.env.SYSTEM_METRICS_ENABLED !== undefined ||
      process.env.METRICS_COLLECT_INTERVAL
    ) {
      metrics = metrics || {};
      metrics.system = {};

      if (process.env.SYSTEM_METRICS_ENABLED !== undefined) {
        metrics.system.enabled = process.env.SYSTEM_METRICS_ENABLED === 'true';
      }
      if (process.env.METRICS_COLLECT_INTERVAL) {
        metrics.system.collectInterval = parseInt(
          process.env.METRICS_COLLECT_INTERVAL,
          10,
        );
      }
    }

    // Business Metrics
    if (process.env.BUSINESS_METRICS_ENABLED !== undefined) {
      metrics = metrics || {};
      metrics.business = {
        enabled: process.env.BUSINESS_METRICS_ENABLED === 'true',
      };
    }

    if (metrics) {
      customConfig.metrics = metrics;
    }

    return customConfig;
  }

  private loadConfiguration(): CompleteMonitoringConfig {
    const env = process.env.NODE_ENV || 'development';
    const appVersion = process.env.APP_VERSION || '1.0.0';

    const configCreator =
      this.envConfigMap[env] || this.envConfigMap.development;
    if (!configCreator) {
      throw new Error(
        `No monitoring configuration found for environment: ${env}`,
      );
    }

    // Start with default config
    let config = this.defaultConfig;

    // Apply environment config
    const envConfig = configCreator(env, appVersion);
    config = this.mergeConfigs(config, envConfig);

    // Apply environment overrides
    const envOverrides = this.environmentConfigs[env];
    if (envOverrides) {
      config = this.mergeConfigs(config, envOverrides);
    }

    // Apply custom config
    const customConfig = this.loadCustomConfig();
    config = this.mergeConfigs(config, customConfig);

    return config;
  }

  static getInstance(): MonitoringConfigurationManager {
    if (!MonitoringConfigurationManager.instance) {
      MonitoringConfigurationManager.instance =
        new MonitoringConfigurationManager();
    }
    return MonitoringConfigurationManager.instance;
  }

  getConfig(): CompleteMonitoringConfig {
    return this.config;
  }

  setEnvironmentConfigs(configs: Record<string, MonitoringConfig>) {
    this.environmentConfigs = configs;
    this.config = this.loadConfiguration();
  }

  updateConfig(updates: MonitoringConfig) {
    this.config = this.mergeConfigs(this.config, updates);
  }

  private environmentConfigs: Record<string, MonitoringConfig> = {};
  private envConfigMap: Record<
    string,
    (env: string, appVersion: string) => MonitoringConfig
  > = {};

  private registerEnvironmentConfigs() {
    this.envConfigMap = {
      development: createDevelopmentConfig,
    };
  }
}
