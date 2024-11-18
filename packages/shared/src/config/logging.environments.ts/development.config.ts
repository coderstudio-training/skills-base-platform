import { join } from 'path';
import { createBaseConfig } from './base.config';

export const createDevelopmentConfig = (env: string, appVersion: string) => {
  const baseConfig = createBaseConfig(env, appVersion);

  return {
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
          days: 90,
          checkInterval: 12 * 60 * 60 * 1000,
        },
      },
    },
  };
};
