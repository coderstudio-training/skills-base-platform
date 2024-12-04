import { SecurityConfig } from '../../interfaces/security.interfaces';

export const createBaseConfig = (): SecurityConfig => ({
  rateLimit: {
    enabled: true,
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    skipPaths: ['/health', '/metrics'],
  },
  apiKey: {
    enabled: false,
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
  bruteForce: {
    enabled: false,
    maxAttempts: 5,
    blockDuration: 30 * 60 * 1000, // 30 minutes
    windowMs: 5 * 60 * 1000, // 5 minutes
  },
});
