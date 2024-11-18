import { MonitoringConfig } from 'src/monitoring/monitoring.types';

export const createBaseConfig = (
  env: string,
  appVersion: string,
): MonitoringConfig => ({
  serviceName: process.env.SERVICE_NAME || 'app',
  enabled: true,
  sampleRate: 1,
  metrics: {
    http: {
      enabled: true,
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 2, 3, 5, 7, 10],
      excludePaths: ['/health', '/metrics'],
    },
    system: {
      enabled: true,
      collectInterval: 10000, // 10 seconds
    },
    business: {
      enabled: true,
    },
  },
  tags: {
    environment: env,
    version: appVersion,
  },
});
