import { LOGGER_CONFIG } from '../config/logger-config';

export const maskSensitiveData = <T extends object>(info: T): T => {
  const masked = { ...info };

  const maskValue = (obj: Record<string, unknown>): void => {
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object') {
        maskValue(value as Record<string, unknown>);
      } else if (typeof value === 'string') {
        if (LOGGER_CONFIG.sensitive.patterns.some(pattern => pattern.test(key))) {
          obj[key] = '***';
        }
      }
    }
  };

  maskValue(masked as Record<string, unknown>);
  return masked;
};

export const handleLokiError = (error: Error) => {
  console.error('Loki connection error:', error);
  // Implement fallback logging if needed
};
