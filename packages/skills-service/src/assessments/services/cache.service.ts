// services/cache.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@skills-base/shared';
import { Cache } from 'cache-manager';
import { CACHE_KEYS, CACHE_TTL } from '../configs/cache.config';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.cacheManager.get(key);
      if (cached) {
        this.logger.log(`Cache hit for key: ${key}`);
        return cached as T;
      }
      return null;
    } catch (error) {
      this.logger.error(`Error retrieving from cache for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttl = CACHE_TTL.ANALYSIS): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
      this.logger.log(`Cache set for key: ${key}`);
    } catch (error) {
      this.logger.error(`Error setting cache for key ${key}:`, error);
    }
  }

  async invalidate(type: 'all' | 'analysis' | 'skills'): Promise<void> {
    try {
      switch (type) {
        case 'all':
          await Promise.all([
            this.cacheManager.del(CACHE_KEYS.SOFT_SKILLS),
            this.cacheManager.del(CACHE_KEYS.ADMIN_ANALYSIS),
            this.cacheManager.del(CACHE_KEYS.DISTRIBUTIONS),
            this.cacheManager.del(CACHE_KEYS.RANKINGS),
          ]);
          break;
        case 'analysis':
          await Promise.all([
            this.cacheManager.del(CACHE_KEYS.ADMIN_ANALYSIS),
            this.cacheManager.del(CACHE_KEYS.DISTRIBUTIONS),
            this.cacheManager.del(CACHE_KEYS.RANKINGS),
          ]);
          break;
        case 'skills':
          await this.cacheManager.del(CACHE_KEYS.SOFT_SKILLS);
          break;
      }
      this.logger.log(`Cache invalidated for type: ${type}`);
    } catch (error) {
      this.logger.error(`Error invalidating cache for type ${type}:`, error);
      throw error;
    }
  }
}
