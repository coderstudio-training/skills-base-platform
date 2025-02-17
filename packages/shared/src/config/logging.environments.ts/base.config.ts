import { join } from 'path';
import { LogLevel } from '../../interfaces/logging.interfaces';

export const getDefaultLogPath = (env: string): string => {
  if (['development', 'test'].includes(env)) {
    return join(process.cwd(), 'logs');
  }
  return env === 'production' ? '/var/log/app' : '/var/log/app-staging';
};

export const createBaseConfig = (env: string, appVersion: string) => {
  const defaultLogPath = getDefaultLogPath(env);

  return {
    logger: {
      level: LogLevel.INFO,
      appVersion,
      format: 'text' as 'json' | 'text',
      outputs: ['console', 'file', 'loki'] as ('console' | 'file' | 'loki')[],
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
          days: 30,
          checkInterval: 24 * 60 * 60 * 1000, // 24 hours
        },
      },
    },
  };
};
