import { SetMetadata } from '@nestjs/common';

export const INVALIDATE_CACHE_KEYS = 'invalidate_cache_keys';

export type CacheKeyGenerator = (args: any[]) => string[];

export const InvalidateCache = (keys: string[] | CacheKeyGenerator) =>
  SetMetadata(INVALIDATE_CACHE_KEYS, keys);
