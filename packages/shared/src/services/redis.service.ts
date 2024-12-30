import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisConfigurationManager } from '../config/redis.config';
import { Logger } from './logger.service';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;
  private readonly logger = new Logger(RedisService.name);
  private readonly config = RedisConfigurationManager.getInstance().getConfig();
  private readonly frontendUrl =
    process.env.FRONTEND_URL || 'http://localhost:3000';

  constructor() {
    this.initializeRedisClient();
    this.setupEventListeners();
  }

  private initializeRedisClient() {
    this.logger.info('Initializing Redis client', {
      host: this.config.host,
      port: this.config.port,
      db: this.config.db,
      keyPrefix: this.config.keyPrefix,
    });

    this.client = new Redis({
      host: this.config.host,
      port: this.config.port,
      password: this.config.password,
      db: this.config.db,
      keyPrefix: this.config.keyPrefix,
      retryStrategy: (times) => {
        const delay = Math.min(times * (this.config.retryDelay || 5000), 2000);
        this.logger.warn('Redis connection retry', {
          attempt: times,
          delay,
          maxAttempts: this.config.retryAttempts,
        });

        if (times > (this.config.retryAttempts || 3)) {
          this.logger.error('Redis max retry attempts reached', {
            attempts: times,
            maxAttempts: this.config.retryAttempts,
          });
          return null;
        }
        return delay;
      },
      reconnectOnError: (err) => {
        this.logger.error('Redis connection error', { error: err });
        return true; // Attempt reconnect on all errors
      },
    });
  }

  private setupEventListeners() {
    this.client.on('connect', () => {
      this.logger.info('Redis client connected');
    });

    this.client.on('ready', () => {
      this.logger.info('Redis client ready');
    });

    this.client.on('error', (error) => {
      this.logger.error('Redis client error', { error });
    });

    this.client.on('close', () => {
      this.logger.warn('Redis connection closed');
    });

    this.client.on('reconnecting', (delay: number) => {
      this.logger.info('Redis client reconnecting', { delay });
    });

    this.client.on('end', () => {
      this.logger.warn('Redis connection ended');
    });
  }

  async onModuleDestroy() {
    this.logger.info('Shutting down Redis connections');
    await this.client.quit();
  }

  // Basic operations with logging
  async get(key: string): Promise<string | null> {
    const startTime = Date.now();
    try {
      const result = await this.client.get(key);
      const duration = Date.now() - startTime;

      this.logger.debug('Redis GET operation', {
        key,
        found: result !== null,
        duration,
        operation: 'get',
      });

      return result;
    } catch (error) {
      this.logger.error('Redis GET operation failed', {
        key,
        error,
        duration: Date.now() - startTime,
        operation: 'get',
      });
      throw error;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    const startTime = Date.now();
    try {
      const result = ttl
        ? await this.client.setex(key, ttl, value)
        : await this.client.set(key, value);

      const duration = Date.now() - startTime;
      this.logger.debug('Redis SET operation', {
        key,
        ttl,
        duration,
        operation: 'set',
      });

      return result;
    } catch (error) {
      this.logger.error('Redis SET operation failed', {
        key,
        ttl,
        error,
        duration: Date.now() - startTime,
        operation: 'set',
      });
      throw error;
    }
  }

  async del(key: string): Promise<number> {
    const startTime = Date.now();
    try {
      const result = await this.client.del(key);
      const duration = Date.now() - startTime;

      this.logger.debug('Redis DEL operation', {
        key,
        deleted: result > 0,
        duration,
        operation: 'del',
      });

      return result;
    } catch (error) {
      this.logger.error('Redis DEL operation failed', {
        key,
        error,
        duration: Date.now() - startTime,
        operation: 'del',
      });
      throw error;
    }
  }

  // Cache management with logging
  async invalidateMultiple(patterns: string[]): Promise<void> {
    const startTime = Date.now();
    const results: { pattern: string; deletedKeys: number }[] = [];

    try {
      for (const pattern of patterns) {
        let searchPattern = pattern;

        // Ensure key prefix is applied correctly
        if (!pattern.startsWith(this.config.keyPrefix || '')) {
          searchPattern = `${this.config.keyPrefix}${pattern}`;
        }

        const keys: string[] = [];
        let cursor = '0';

        // SCAN for keys matching the pattern
        do {
          const [newCursor, foundKeys] = await this.client.scan(
            cursor,
            'MATCH',
            searchPattern,
            'COUNT',
            100,
          );
          cursor = newCursor;
          keys.push(...foundKeys);
        } while (cursor !== '0');

        let deletedCount = 0;

        if (keys.length > 0) {
          const redisKeys = keys.map((key) =>
            this.client.options.keyPrefix ? key : key,
          );
          deletedCount = (await this.client.call(
            'DEL',
            ...redisKeys,
          )) as number;
        }

        results.push({
          pattern: searchPattern,
          deletedKeys: deletedCount,
        });
      }

      this.logger.info('Cache invalidation completed', {
        patterns,
        results,
        duration: Date.now() - startTime,
      });

      // Notify frontend about cache invalidation asynchronously
      this.notifyFrontendOfInvalidation(patterns).catch((error) => {
        this.logger.error('Frontend cache invalidation notification failed', {
          error,
          patterns,
        });
      });
    } catch (error) {
      this.logger.error('Cache invalidation failed', {
        patterns,
        error,
        duration: Date.now() - startTime,
      });
      throw error;
    }
  }

  private async notifyFrontendOfInvalidation(
    patterns: string[],
  ): Promise<void> {
    const maxRetries = 3;
    let retryCount = 0;

    const payload = {
      paths: ['/'],
      tags: ['all'],
    };

    while (retryCount < maxRetries) {
      try {
        const response = await fetch(`${this.frontendUrl}/api/revalidate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        this.logger.info('Frontend cache invalidation notification sent', {
          patterns,
          response: data,
        });
        return;
      } catch (error) {
        retryCount++;

        if (retryCount === maxRetries) {
          this.logger.error('Failed to notify frontend of cache invalidation', {
            error,
            patterns,
            frontendUrl: this.frontendUrl,
            attempts: retryCount,
          });
          return;
        }

        await new Promise((resolve) =>
          setTimeout(resolve, Math.min(1000 * Math.pow(2, retryCount), 5000)),
        );
      }
    }
  }
}
