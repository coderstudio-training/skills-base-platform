import { SetMetadata } from '@nestjs/common';

export const REDIS_CACHE_KEY_METADATA = 'redis_cache_key';
export const REDIS_CACHE_TTL_METADATA = 'redis_cache_ttl';
export const REDIS_CACHE_KEY_GENERATOR = 'redis_cache_key_generator';
export const REDIS_CACHE_CONDITION = 'redis_cache_condition';

export interface RedisCacheOptions {
  ttl?: number;
  key?: string;
  keyGenerator?: (context: RedisCacheContext) => string | Promise<string>;
  condition?: (context: RedisCacheContext) => boolean | Promise<boolean>;
}

export interface RedisCacheContext {
  request: {
    path: string;
    method: string;
    params: Record<string, any>;
    query: Record<string, any>;
    body: any;
    headers: Record<string, any>;
    user?: any;
  };
  args: any[];
  executionContext: any;
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

    if (options.condition) {
      SetMetadata(REDIS_CACHE_CONDITION, options.condition)(
        target,
        propertyKey,
        descriptor,
      );
    }

    return descriptor;
  };
};
