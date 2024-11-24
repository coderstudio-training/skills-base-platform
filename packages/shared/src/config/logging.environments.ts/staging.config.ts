import { join } from 'path';
import { LogLevel } from '../../interfaces/logging.interfaces';
import { createBaseConfig } from './base.config';

export const createStagingConfig = (env: string, appVersion: string) => {
  const baseConfig = createBaseConfig(env, appVersion);

  return {
    logger: {
      ...baseConfig.logger,
      level: LogLevel.DEBUG,
      format: 'json' as 'json' | 'text',
      outputs: ['console', 'file'] as ('console' | 'file')[],
      filename: join('/var/log/app-staging', `${env}-app.log`),
      file: {
        path: '/var/log/app-staging',
        namePattern: `${env}-app-%DATE%.log`,
        rotatePattern: 'YYYY-MM-DD',
        permissions: 0o644,
        compress: true,
        retention: {
          enabled: true,
          days: 90,
          checkInterval: 12 * 60 * 60 * 1000,
        },
      },
    },
  };
};
