import { SecurityConfig } from '../../interfaces/security.interfaces';

export const createBaseConfig = (): SecurityConfig => ({
  adminEmail: 'admin@example.com',
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
    enabled: true,
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
