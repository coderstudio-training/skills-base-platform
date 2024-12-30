// utils/request-tracker.ts
import { ApiError } from '../api/types';
import { logger } from './logger';

export interface RequestMetrics {
  duration: number;
  url: string;
  method: string;
  status?: number;
}

/**
 * Tracks the performance of an API request
 */
export async function trackRequest<T>(
  operation: () => Promise<T>,
  url: string,
  method: string = 'GET',
): Promise<T> {
  // Only track on server side
  if (typeof window !== 'undefined') {
    return operation();
  }

  const startTime = performance.now();

  try {
    const result = await operation();
    const duration = Math.round(performance.now() - startTime);

    // Log success metrics
    logger.info('API Request completed', {
      performance: {
        duration,
        url: url,
        method: method,
        status: (result as { status: number }).status,
      },
    });

    return result;
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);

    // Log error metrics
    logger.error('API Request failed', {
      error: error as ApiError,
      performance: {
        duration,
        url: url,
        method: method,
      },
    });
    throw error;
  }
}
