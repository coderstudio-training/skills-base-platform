import { join } from 'path';
import { LogLevel } from '../../types';
import { createBaseConfig } from './base.config';

export const createProductionConfig = (env: string, appVersion: string) => {
  const baseConfig = createBaseConfig(env, appVersion);

  return {
    logger: {
      ...baseConfig.logger,
      level: LogLevel.INFO,
      format: 'json' as 'json' | 'text',
      outputs: ['console', 'file', 'loki'] as ('console' | 'file' | 'loki')[],
      filename: join('/var/log/app', `${env}-app.log`),
      file: {
        path: '/var/log/app',
        namePattern: 'app-%DATE%.log',
        rotatePattern: 'YYYY-MM-DD-HH',
        permissions: 0o644,
        compress: true,
        retention: {
          enabled: true,
          days: 90,
          checkInterval: 12 * 60 * 60 * 1000,
        },
      },
    },
    errorTracker: {
      ...baseConfig.errorTracker,
      sampleRate: 1,
      maxStackFrames: 20,
    },
  };
};
