import { SetMetadata } from '@nestjs/common';

export const INVALIDATE_CACHE_KEYS = 'invalidate_cache_keys';
export const INVALIDATE_CACHE_KEY_GENERATORS =
  'invalidate_cache_key_generators';
export const INVALIDATE_CACHE_CONDITION = 'invalidate_cache_condition';

export interface CacheInvalidationContext {
  request: {
    path: string;
    method: string;
    params: Record<string, any>;
    query: Record<string, any>;
    body: any;
    headers: Record<string, any>;
    user?: any;
  };
  response: any;
  args: any[];
  executionContext: any;
}

export interface InvalidateCacheOptions {
  keys?: string[];
  keyGenerators?: ((
    context: CacheInvalidationContext,
  ) => string[] | Promise<string[]>)[];
  condition?: (context: CacheInvalidationContext) => boolean | Promise<boolean>;
}

export function InvalidateCache(
  keysOrOptions: string[] | InvalidateCacheOptions,
) {
  const options: InvalidateCacheOptions = Array.isArray(keysOrOptions)
    ? { keys: keysOrOptions }
    : keysOrOptions;

  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    if (options.keys) {
      SetMetadata(INVALIDATE_CACHE_KEYS, options.keys)(
        target,
        propertyKey,
        descriptor,
      );
    }

    if (options.keyGenerators) {
      SetMetadata(INVALIDATE_CACHE_KEY_GENERATORS, options.keyGenerators)(
        target,
        propertyKey,
        descriptor,
      );
    }

    if (options.condition) {
      SetMetadata(INVALIDATE_CACHE_CONDITION, options.condition)(
        target,
        propertyKey,
        descriptor,
      );
    }

    return descriptor;
  };
}
