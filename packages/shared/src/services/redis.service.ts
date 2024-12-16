import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisConfigurationManager } from '../config/redis.config';
import { Logger } from './logger.service';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;
  private subscribers: Map<string, Redis> = new Map();
  private readonly logger = new Logger(RedisService.name);
  private readonly config = RedisConfigurationManager.getInstance().getConfig();

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
        const delay = Math.min(times * (this.config.retryDelay || 50), 2000);
        this.logger.warn('Redis connection retry', {
          attempt: times,
          delay,
          maxAttempts: this.config.retryAttempts,
        });

        if (times > (this.config.retryAttempts || 10)) {
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

    for (const [channel, subscriber] of this.subscribers.entries()) {
      this.logger.info('Closing subscriber connection', { channel });
      await subscriber.quit();
    }
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
        const keys = await this.client.keys(pattern);
        let deletedCount = 0;

        if (keys.length > 0) {
          deletedCount = await this.client.del(...keys);
        }

        results.push({
          pattern,
          deletedKeys: deletedCount,
        });
      }

      this.logger.info('Cache invalidation completed', {
        patterns,
        results,
        duration: Date.now() - startTime,
        operation: 'invalidateMultiple',
      });
    } catch (error) {
      this.logger.error('Cache invalidation failed', {
        patterns,
        error,
        duration: Date.now() - startTime,
        operation: 'invalidateMultiple',
      });
      throw error;
    }
  }

  async invalidateByPrefix(prefix: string): Promise<void> {
    const startTime = Date.now();
    try {
      const keys = await this.client.keys(`${prefix}:*`);
      const deletedCount = keys.length > 0 ? await this.client.del(...keys) : 0;

      this.logger.info('Prefix-based cache invalidation completed', {
        prefix,
        matchedKeys: keys.length,
        deletedKeys: deletedCount,
        duration: Date.now() - startTime,
        operation: 'invalidateByPrefix',
      });
    } catch (error) {
      this.logger.error('Prefix-based cache invalidation failed', {
        prefix,
        error,
        duration: Date.now() - startTime,
        operation: 'invalidateByPrefix',
      });
      throw error;
    }
  }

  // Lock management with logging
  async lock(key: string, ttl: number): Promise<string | null> {
    const token = Math.random().toString(36).slice(2);
    const startTime = Date.now();

    try {
      const result = await this.client.set(
        `lock:${key}`,
        token,
        'EX',
        ttl,
        'NX',
      );

      const duration = Date.now() - startTime;
      this.logger.debug('Lock operation', {
        key,
        acquired: result === 'OK',
        ttl,
        duration,
        operation: 'lock',
      });

      return result === 'OK' ? token : null;
    } catch (error) {
      this.logger.error('Lock operation failed', {
        key,
        ttl,
        error,
        duration: Date.now() - startTime,
        operation: 'lock',
      });
      throw error;
    }
  }

  async unlock(key: string, token: string): Promise<boolean> {
    const startTime = Date.now();
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    try {
      const result = await this.client.eval(script, 1, `lock:${key}`, token);

      const duration = Date.now() - startTime;
      const unlocked = result === 1;

      this.logger.debug('Unlock operation', {
        key,
        unlocked,
        duration,
        operation: 'unlock',
      });

      return unlocked;
    } catch (error) {
      this.logger.error('Unlock operation failed', {
        key,
        error,
        duration: Date.now() - startTime,
        operation: 'unlock',
      });
      throw error;
    }
  }

  // Pub/Sub with logging
  async publish(channel: string, message: any): Promise<number> {
    const startTime = Date.now();
    try {
      const result = await this.client.publish(
        channel,
        JSON.stringify(message),
      );

      const duration = Date.now() - startTime;
      this.logger.debug('Message published', {
        channel,
        recipientCount: result,
        duration,
        operation: 'publish',
      });

      return result;
    } catch (error) {
      this.logger.error('Publish operation failed', {
        channel,
        error,
        duration: Date.now() - startTime,
        operation: 'publish',
      });
      throw error;
    }
  }

  async subscribe(
    channel: string,
    callback: (message: any) => void,
  ): Promise<void> {
    if (!this.subscribers.has(channel)) {
      const startTime = Date.now();
      try {
        const subscriber = this.client.duplicate();

        subscriber.on('message', (chan, message) => {
          if (chan === channel) {
            try {
              const parsedMessage = JSON.parse(message);
              callback(parsedMessage);

              this.logger.debug('Message received', {
                channel,
                operation: 'subscribe.receive',
              });
            } catch (error) {
              this.logger.error('Error processing subscription message', {
                channel,
                error,
                operation: 'subscribe.receive',
              });
            }
          }
        });

        await subscriber.subscribe(channel);
        this.subscribers.set(channel, subscriber);

        this.logger.info('Channel subscription established', {
          channel,
          duration: Date.now() - startTime,
          operation: 'subscribe',
        });
      } catch (error) {
        this.logger.error('Subscription failed', {
          channel,
          error,
          duration: Date.now() - startTime,
          operation: 'subscribe',
        });
        throw error;
      }
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    const startTime = Date.now();
    const subscriber = this.subscribers.get(channel);

    if (subscriber) {
      try {
        await subscriber.unsubscribe(channel);
        await subscriber.quit();
        this.subscribers.delete(channel);

        this.logger.info('Channel unsubscribed', {
          channel,
          duration: Date.now() - startTime,
          operation: 'unsubscribe',
        });
      } catch (error) {
        this.logger.error('Unsubscribe operation failed', {
          channel,
          error,
          duration: Date.now() - startTime,
          operation: 'unsubscribe',
        });
        throw error;
      }
    }
  }
}
