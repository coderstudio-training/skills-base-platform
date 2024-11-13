import { join } from 'path';
import {
  ErrorTrackerConfig,
  LoggerConfig,
  LogLevel,
  WinstonLoggerConfig,
} from './types';

export class ConfigurationManager {
  private static instance: ConfigurationManager;
  private config: {
    logger: LoggerConfig;
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

  private getDefaultLogPath(): string {
    const env = process.env.NODE_ENV || 'development';
    // Use project directory for development and testing
    if (['development', 'test'].includes(env)) {
      return join(process.cwd(), 'logs');
    }
    // Use system logs for production and staging
    return env === 'production' ? '/var/log/app' : '/var/log/app-staging';
  }

  private loadConfiguration() {
    const env = process.env.NODE_ENV || 'development';
    const appVersion = process.env.APP_VERSION || '1.0.0';
    const defaultLogPath = this.getDefaultLogPath();

    const baseConfig = {
      logger: {
        level: LogLevel.INFO,
        format: 'text' as 'text' | 'json',
        outputs: ['console', 'file'] as ('console' | 'file')[],
        filename: 'app.log',
        maxSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
        file: {
          path: process.env.LOG_PATH || defaultLogPath,
          namePattern: `${env}-%DATE%.log`,
          rotatePattern: 'YYYY-MM-DD',
          permissions: 0o644,
          compress: env === 'production',
          retention: {
            enabled: true,
            days: 30, // Default 30 days retention
            checkInterval: 24 * 60 * 60 * 1000, // Check daily
          },
        },
      },
      monitor: {
        enabled: true,
        sampleRate: 1,
        metricsInterval: 60000,
        tags: {
          environment: env,
          version: appVersion,
        },
        enableMetrics: true, // Enable Prometheus metrics by default
        metricsPrefix: 'test metrics prefix',
        customBuckets: {
          http: [0.1, 0.3, 0.5, 0.7, 1, 2, 3, 5, 7, 10], // Default HTTP latency buckets
          operation: [0.01, 0.05, 0.1, 0.5, 1, 2.5, 5, 10], // Default operation buckets
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
          filename: join('/var/log/app', `${env}-app.log`),
          file: {
            path: '/var/log/app',
            namePattern: 'app-%DATE%.log',
            rotatePattern: 'YYYY-MM-DD-HH',
            permissions: 0o644,
            compress: true,
            retention: {
              enabled: true,
              days: 90, // Keep logs longer in production
              checkInterval: 12 * 60 * 60 * 1000, // Check twice daily
            },
          },
        },
        monitor: {
          ...baseConfig.monitor,
          metricsInterval: 30000,
          sampleRate: 0.1,
          enableMetrics: true,
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
          filename: join('/var/log/app-staging', `${env}-app.log`),
          file: {
            path: '/var/log/app-staging',
            namePattern: `${env}-app-%DATE%.log`,
            rotatePattern: 'YYYY-MM-DD',
            permissions: 0o644,
            compress: true,
            retention: {
              enabled: true,
              days: 90, // Keep logs longer in production
              checkInterval: 12 * 60 * 60 * 1000, // Check twice daily
            },
          },
        },
        monitor: {
          ...baseConfig.monitor,
          metricsInterval: 45000,
          sampleRate: 0.5,
          enableMetrics: true,
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
          file: {
            path: join(process.cwd(), 'logs', 'test'),
            namePattern: 'test-%DATE%.log',
            rotatePattern: 'YYYY-MM-DD',
            permissions: 0o644,
            compress: false,
            retention: {
              enabled: true,
              days: 90, // Keep logs longer in production
              checkInterval: 12 * 60 * 60 * 1000, // Check twice daily
            },
          },
        },
        monitor: {
          ...baseConfig.monitor,
          enabled: false,
          enableMetrics: false,
        },

        errorTracker: {
          ...baseConfig.errorTracker,
          sampleRate: 0,
        },
      },
      development: {
        ...baseConfig,
        logger: {
          ...baseConfig.logger,
          file: {
            path: join(process.cwd(), 'logs', 'dev'),
            namePattern: 'dev-%DATE%.log',
            rotatePattern: 'YYYY-MM-DD',
            permissions: 0o644,
            compress: false,
            retention: {
              enabled: true,
              days: 90, // Keep logs longer in production
              checkInterval: 12 * 60 * 60 * 1000, // Check twice daily
            },
          },
        },
        monitor: {
          ...baseConfig.monitor,
          enableMetrics: true,
        },
      },
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
      errorTracker: Partial<ErrorTrackerConfig>;
    }> = {
      logger: {},
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

    return customConfig;
  }

  getLoggerConfig(): WinstonLoggerConfig {
    return this.config.logger;
  }

  getErrorTrackerConfig(): ErrorTrackerConfig {
    return this.config.errorTracker;
  }

  updateConfig(
    updates: Partial<{
      logger: Partial<LoggerConfig>;
      errorTracker: Partial<ErrorTrackerConfig>;
    }>,
  ) {
    this.config = {
      logger: { ...this.config.logger, ...updates.logger },
      errorTracker: { ...this.config.errorTracker, ...updates.errorTracker },
    };
  }
}
