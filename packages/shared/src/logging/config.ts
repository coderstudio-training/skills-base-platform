import {
  ErrorTrackerConfig,
  LoggerConfig,
  LogLevel,
  MonitorConfig,
} from './types';

export class ConfigurationManager {
  private static instance: ConfigurationManager;
  private config: {
    logger: LoggerConfig;
    monitor: MonitorConfig;
    errorTracker: ErrorTrackerConfig;
  };

  private constructor() {
    this.config = this.loadConfiguration();
  }

  static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  private loadConfiguration() {
    const env = process.env.NODE_ENV || 'development';
    const appVersion = process.env.APP_VERSION || '1.0.0';

    const baseConfig = {
      logger: {
        level: LogLevel.INFO,
        format: 'text' as 'text' | 'json',
        outputs: ['console'] as ('console' | 'file')[],
        filename: 'app.log',
        maxSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
      },
      monitor: {
        enabled: true,
        sampleRate: 1,
        metricsInterval: 60000, // 1 minute
        tags: {
          environment: env,
          version: appVersion,
        },
      },
      errorTracker: {
        sampleRate: 1,
        environment: env,
        release: appVersion,
        contextLines: 3,
        maxStackFrames: 50,
      },
    };

    const envConfigs: Record<string, typeof baseConfig> = {
      production: {
        logger: {
          ...baseConfig.logger,
          level: LogLevel.INFO,
          format: 'json',
          outputs: ['console', 'file'],
          filename: `/var/log/app/${env}-app.log`,
        },
        monitor: {
          ...baseConfig.monitor,
          metricsInterval: 30000,
          sampleRate: 0.1,
        },
        errorTracker: {
          ...baseConfig.errorTracker,
          sampleRate: 1,
          maxStackFrames: 20,
        },
      },
      staging: {
        logger: {
          ...baseConfig.logger,
          level: LogLevel.DEBUG,
          format: 'json',
          outputs: ['console', 'file'],
          filename: `/var/log/app/${env}-app.log`,
        },
        monitor: {
          ...baseConfig.monitor,
          metricsInterval: 45000,
          sampleRate: 0.5,
        },
        errorTracker: {
          ...baseConfig.errorTracker,
          sampleRate: 1,
          contextLines: 5,
        },
      },
      test: {
        logger: {
          ...baseConfig.logger,
          level: LogLevel.DEBUG,
          format: 'text',
          outputs: ['console'],
        },
        monitor: {
          ...baseConfig.monitor,
          enabled: false,
        },
        errorTracker: {
          ...baseConfig.errorTracker,
          sampleRate: 0,
        },
      },
      development: baseConfig,
    };

    const envConfig = envConfigs[env] || envConfigs.development;
    const customConfig = this.loadCustomConfig();

    return {
      logger: {
        ...baseConfig.logger,
        ...envConfig.logger,
        ...customConfig.logger,
      },
      monitor: {
        ...baseConfig.monitor,
        ...envConfig.monitor,
        ...customConfig.monitor,
      },
      errorTracker: {
        ...baseConfig.errorTracker,
        ...envConfig.errorTracker,
        ...customConfig.errorTracker,
      },
    };
  }

  private loadCustomConfig() {
    const customConfig: Partial<{
      logger: Partial<LoggerConfig>;
      monitor: Partial<MonitorConfig>;
      errorTracker: Partial<ErrorTrackerConfig>;
    }> = {
      logger: {},
      monitor: {},
      errorTracker: {},
    };

    if (process.env.LOG_LEVEL) {
      customConfig.logger!.level = process.env.LOG_LEVEL as LogLevel;
    }
    if (process.env.LOG_FORMAT) {
      customConfig.logger!.format = process.env.LOG_FORMAT as 'json' | 'text';
    }
    if (process.env.LOG_OUTPUTS) {
      customConfig.logger!.outputs = process.env.LOG_OUTPUTS.split(',') as (
        | 'console'
        | 'file'
      )[];
    }
    if (process.env.MONITOR_ENABLED) {
      customConfig.monitor!.enabled = process.env.MONITOR_ENABLED === 'true';
    }
    if (process.env.MONITOR_SAMPLE_RATE) {
      customConfig.monitor!.sampleRate = parseFloat(
        process.env.MONITOR_SAMPLE_RATE,
      );
    }

    return customConfig;
  }

  getLoggerConfig(): LoggerConfig {
    return this.config.logger;
  }

  getMonitorConfig(): MonitorConfig {
    return this.config.monitor;
  }

  getErrorTrackerConfig(): ErrorTrackerConfig {
    return this.config.errorTracker;
  }

  updateConfig(
    updates: Partial<{
      logger: Partial<LoggerConfig>;
      monitor: Partial<MonitorConfig>;
      errorTracker: Partial<ErrorTrackerConfig>;
    }>,
  ) {
    this.config = {
      logger: { ...this.config.logger, ...updates.logger },
      monitor: { ...this.config.monitor, ...updates.monitor },
      errorTracker: { ...this.config.errorTracker, ...updates.errorTracker },
    };
  }
}
