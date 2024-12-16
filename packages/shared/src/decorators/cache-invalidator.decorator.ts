import { SetMetadata } from '@nestjs/common';

export const INVALIDATE_CACHE_KEYS = 'invalidate_cache_keys';

export const InvalidateCache = (
  keys: string[] | ((args: any[]) => string[]),
) => {
  return SetMetadata(INVALIDATE_CACHE_KEYS, keys);
};
