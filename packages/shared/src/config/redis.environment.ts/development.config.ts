import { RedisConfig } from '../../interfaces/redis.interface';

export function createDevelopmentConfig(env: string): RedisConfig {
  return {
    host: 'localhost',
    port: 6379,
    password: undefined,
    db: 0,
    keyPrefix: `${env}:`,
    ttl: 3600, // 1 hour
    retryAttempts: 3,
    retryDelay: 10000,
  };
}
