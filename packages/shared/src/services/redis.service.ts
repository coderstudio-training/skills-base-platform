import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisConfig } from '../interfaces/redis.interface';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;
  private subscribers: Map<string, Redis> = new Map();

  constructor(@Inject('REDIS_CONFIG') private config: RedisConfig) {
    this.client = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db,
      keyPrefix: config.keyPrefix,
      retryStrategy: (times) => {
        if (times > (config.retryAttempts || 10)) {
          return null;
        }
        return Math.min(times * (config.retryDelay || 50), 2000);
      },
    });

    this.client.on('error', (error) => {
      console.error('Redis client error:', error);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
    for (const subscriber of this.subscribers.values()) {
      await subscriber.quit();
    }
  }

  // Basic operations
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    return ttl
      ? this.client.setex(key, ttl, value)
      : this.client.set(key, value);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  // Cache management
  async invalidateMultiple(patterns: string[]): Promise<void> {
    for (const pattern of patterns) {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    }
  }

  async invalidateByPrefix(prefix: string): Promise<void> {
    const keys = await this.client.keys(`${prefix}:*`);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  async updateCache<T>(
    key: string,
    updater: (existing: T | null) => Promise<T | null> | T | null,
    ttl?: number,
  ): Promise<void> {
    const existing = await this.get(key);
    const currentValue = existing ? JSON.parse(existing) : null;
    const newValue = await updater(currentValue);

    if (newValue === null) {
      await this.del(key);
    } else {
      await this.set(key, JSON.stringify(newValue), ttl);
    }
  }

  async lock(key: string, ttl: number): Promise<string | null> {
    const token = Math.random().toString(36).slice(2);
    // Using SetOptions from ioredis
    const result = await this.client.set(`lock:${key}`, token, 'EX', ttl, 'NX');
    return result === 'OK' ? token : null;
  }

  async unlock(key: string, token: string): Promise<boolean> {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    return (await this.client.eval(script, 1, `lock:${key}`, token)) === 1;
  }

  // Pub/Sub
  async publish(channel: string, message: any): Promise<number> {
    return this.client.publish(channel, JSON.stringify(message));
  }

  async subscribe(
    channel: string,
    callback: (message: any) => void,
  ): Promise<void> {
    if (!this.subscribers.has(channel)) {
      const subscriber = this.client.duplicate();
      await subscriber.subscribe(channel);
      subscriber.on('message', (chan, message) => {
        if (chan === channel) {
          try {
            callback(JSON.parse(message));
          } catch (error) {
            console.error('Error processing message:', error);
          }
        }
      });
      this.subscribers.set(channel, subscriber);
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    const subscriber = this.subscribers.get(channel);
    if (subscriber) {
      await subscriber.unsubscribe(channel);
      await subscriber.quit();
      this.subscribers.delete(channel);
    }
  }
}
