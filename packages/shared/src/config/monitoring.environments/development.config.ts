import { MonitoringConfig } from '../../interfaces/monitoring.interfaces';
import { createBaseConfig } from './base.config';

export const createDevelopmentConfig = (
  env: string,
  appVersion: string,
): MonitoringConfig => {
  const baseConfig = createBaseConfig(env, appVersion);
  return {
    ...baseConfig,
    sampleRate: 1,
    metrics: {
      ...baseConfig.metrics?.system, // Use optional chaining operator
      system: {
        ...baseConfig.metrics?.system, // Use optional chaining operator
        collectInterval: 30000, // 30 seconds for development
      },
    },
  };
};
