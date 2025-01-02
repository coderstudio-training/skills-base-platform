// utils/performance-monitor.ts
import { LOGGER_CONFIG } from '../config/logger-config';
import type { LogMetadata } from '../types/logger';
import { logger } from './logger';

export interface RequestMetrics {
  duration: number;
  url: string;
  method: string;
  status?: number;
  memoryUsage?: number;
}

export class PerformanceMonitor {
  private async getMemoryUsage(): Promise<number | undefined> {
    if (typeof window === 'undefined') {
      try {
        const used = process.memoryUsage();
        return used.heapUsed;
      } catch {
        return undefined;
      }
    }
    return undefined;
  }

  async trackRequest<T>(
    operation: () => Promise<T>,
    url: string,
    method: string = 'GET',
    metadata?: LogMetadata,
  ): Promise<T> {
    const startTime = performance.now();
    const initialMemory = await this.getMemoryUsage();

    try {
      const result = await operation();
      const endTime = performance.now();
      const finalMemory = await this.getMemoryUsage();

      const metrics: RequestMetrics = {
        duration: Math.round(endTime - startTime),
        url,
        method,
        status: (result as { status?: number })?.status,
        memoryUsage:
          initialMemory && finalMemory ? Math.max(0, finalMemory - initialMemory) : undefined,
      };

      // Check performance thresholds
      if (metrics.duration > LOGGER_CONFIG.performance.apiTimeout) {
        logger.warn('Request exceeded timeout threshold', {
          ...metadata,
          performance: metrics,
        });
      }

      if (metrics.memoryUsage && metrics.memoryUsage > LOGGER_CONFIG.performance.memoryThreshold) {
        logger.warn('Memory usage exceeded threshold', {
          ...metadata,
          performance: metrics,
        });
      }

      // Log successful request metrics
      logger.info('Request completed', {
        ...metadata,
        performance: metrics,
      });

      return result;
    } catch (error) {
      const endTime = performance.now();
      const finalMemory = await this.getMemoryUsage();

      const metrics: RequestMetrics = {
        duration: Math.round(endTime - startTime),
        url,
        method,
        status: (error as { status?: number })?.status || 500,
        memoryUsage:
          initialMemory && finalMemory ? Math.max(0, finalMemory - initialMemory) : undefined,
      };

      // Log failed request
      logger.error(error instanceof Error ? error : 'Request failed', {
        ...metadata,
        performance: metrics,
      });

      throw error;
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();
