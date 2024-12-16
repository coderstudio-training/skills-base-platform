import { SetMetadata } from '@nestjs/common';

// Changed to be Redis-specific to avoid conflicts
export const REDIS_CACHE_KEY_METADATA = 'redis_cache_key';
export const REDIS_CACHE_TTL_METADATA = 'redis_cache_ttl';
export const REDIS_CACHE_KEY_GENERATOR = 'redis_cache_key_generator';

export interface RedisCacheOptions {
  ttl?: number;
  key?: string;
  keyGenerator?: (...args: any[]) => string;
}

export const RedisCache = (
  keyOrOptions?: string | RedisCacheOptions,
  ttl?: number,
) => {
  const options: RedisCacheOptions =
    typeof keyOrOptions === 'string'
      ? { key: keyOrOptions, ttl }
      : keyOrOptions || {};

  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(
      REDIS_CACHE_KEY_METADATA,
      options.key || `${target.constructor.name}:${propertyKey}`,
    )(target, propertyKey, descriptor);
    SetMetadata(REDIS_CACHE_TTL_METADATA, options.ttl)(
      target,
      propertyKey,
      descriptor,
    );
    if (options.keyGenerator) {
      SetMetadata(REDIS_CACHE_KEY_GENERATOR, options.keyGenerator)(
        target,
        propertyKey,
        descriptor,
      );
    }
    return descriptor;
  };
};
