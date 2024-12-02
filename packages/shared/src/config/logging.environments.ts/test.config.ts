import { join } from 'path';
import { LogLevel } from '../../interfaces/logging.interfaces';
import { createBaseConfig } from './base.config';

export const createTestConfig = (env: string, appVersion: string) => {
  const baseConfig = createBaseConfig(env, appVersion);

  return {
    logger: {
      ...baseConfig.logger,
      level: LogLevel.DEBUG,
      format: 'text' as 'json' | 'text',
      outputs: ['console'] as ('console' | 'file')[],
      file: {
        path: join(process.cwd(), 'logs', 'test'),
        namePattern: 'test-%DATE%.log',
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
