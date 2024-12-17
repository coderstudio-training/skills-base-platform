import { createBaseConfig } from './base.config';

export const createDevelopmentConfig = () => {
  const baseConfig = createBaseConfig();

  return {
    ...baseConfig,
  };
};
