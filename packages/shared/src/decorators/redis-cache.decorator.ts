import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'redis_cache_key';
export const CACHE_TTL_METADATA = 'redis_cache_ttl';

export const RedisCache = (key?: string, ttl?: number) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(
      CACHE_KEY_METADATA,
      key || `${target.constructor.name}:${propertyKey}`,
    )(target, propertyKey, descriptor);
    SetMetadata(CACHE_TTL_METADATA, ttl)(target, propertyKey, descriptor);
    return descriptor;
  };
};
