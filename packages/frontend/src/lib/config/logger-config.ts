export const LOGGER_CONFIG = {
  service: 'frontend',
  loki: {
    host: process.env.LOKI_HOST || 'http://loki:3100',
    batchInterval: 5000, // 5 seconds
    timeout: 10000, // 10 seconds
  },
  sensitive: {
    patterns: [
      /password/i,
      /token/i,
      /key/i,
      /secret/i,
      /credential/i,
      /authorization/i,
      /bearer/i,
      /session/i,
      /cookie/i,
      /api[-_]?key/i,
      /access[-_]?token/i,
      /refresh[-_]?token/i,
    ],
  },
  performance: {
    apiTimeout: 5000, // 5 seconds
    memoryThreshold: 1073741824, // 1GB
  },
};
