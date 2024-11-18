import { createBaseConfig } from './base.config';

export const createDevelopmentConfig = () => {
  const baseConfig = createBaseConfig();

  return {
    ...baseConfig,
    rateLimit: {
      ...baseConfig.rateLimit,
      enabled: false, // Disabled in development by default
    },
    apiKey: {
      ...baseConfig.apiKey,
      enabled: false, // Disabled in development by default
    },
  };
};
