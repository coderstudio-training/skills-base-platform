import { SecurityConfig } from '../../types';

export const createBaseConfig = (): SecurityConfig => ({
  rateLimit: {
    enabled: true,
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    skipPaths: ['/health', '/metrics'],
  },
  apiKey: {
    enabled: true,
    keys: [],
    excludePaths: ['/health', '/metrics'],
  },
  ipWhitelist: {
    enabled: false,
    allowedIps: [],
    maxFailedAttempts: 5,
    blockDuration: 30 * 60 * 1000, // 30 minutes
  },
  payload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedContentTypes: [
      'application/json',
      'application/x-www-form-urlencoded',
      'multipart/form-data',
    ],
  },
});
