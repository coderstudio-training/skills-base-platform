import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  REDIS_CACHE_CONDITION,
  REDIS_CACHE_KEY_GENERATOR,
  REDIS_CACHE_KEY_METADATA,
  REDIS_CACHE_TTL_METADATA,
  RedisCacheContext,
} from '../decorators/redis-cache.decorator';
import { Logger } from '../services/logger.service';
import { RedisService } from '../services/redis.service';

@Injectable()
export class RedisCacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RedisCacheInterceptor.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const key = this.reflector.get(
      REDIS_CACHE_KEY_METADATA,
      context.getHandler(),
    );
    if (!key) return next.handle();

    const ttl = this.reflector.get(
      REDIS_CACHE_TTL_METADATA,
      context.getHandler(),
    );
    const keyGenerator = this.reflector.get(
      REDIS_CACHE_KEY_GENERATOR,
      context.getHandler(),
    );
    const condition = this.reflector.get(
      REDIS_CACHE_CONDITION,
      context.getHandler(),
    );

    const cacheContext = this.createCacheContext(context);

    // Check if caching should be skipped based on condition
    if (condition) {
      const shouldCache = await condition(cacheContext);
      if (!shouldCache) {
        return next.handle();
      }
    }

    const finalKey = await this.generateCacheKey(
      key,
      keyGenerator,
      cacheContext,
    );

    try {
      const cachedValue = await this.redisService.get(finalKey);

      if (cachedValue) {
        this.logger.info('Cache hit', {
          key: finalKey,
          handler: context.getHandler().name,
        });
        return of(JSON.parse(cachedValue));
      }

      this.logger.info('Cache miss', {
        key: finalKey,
        handler: context.getHandler().name,
      });

      return next.handle().pipe(
        tap(async (response) => {
          try {
            await this.redisService.set(
              finalKey,
              JSON.stringify(response),
              ttl,
            );
            this.logger.debug('Cached value set', {
              key: finalKey,
              ttl,
              handler: context.getHandler().name,
            });
          } catch (error) {
            this.logger.error('Failed to cache value', {
              key: finalKey,
              error,
              handler: context.getHandler().name,
            });
          }
        }),
      );
    } catch (error) {
      this.logger.error('Cache operation failed', {
        key: finalKey,
        error,
        handler: context.getHandler().name,
      });
      return next.handle();
    }
  }

  private createCacheContext(context: ExecutionContext): RedisCacheContext {
    const request = context.switchToHttp().getRequest();
    const args = context.getArgs();

    return {
      request: {
        path: request.path,
        method: request.method,
        params: request.params || {},
        query: request.query || {},
        body: request.body,
        headers: request.headers,
        user: request.user,
      },
      args,
      executionContext: context,
    };
  }

  private async generateCacheKey(
    baseKey: string,
    keyGenerator:
      | ((context: RedisCacheContext) => string | Promise<string>)
      | undefined,
    context: RedisCacheContext,
  ): Promise<string> {
    if (keyGenerator) {
      return keyGenerator(context);
    }

    const { params, query } = context.request;
    const keyParts = [
      baseKey,
      Object.entries(params)
        .map(([, value]) => `${value}`)
        .join(':'),
      Object.entries(query)
        .filter(([key]) => !key.includes('_cache')) // Filter out _cache parameters
        .map(([, value]) => `${value}`)
        .join(':'),
    ].filter(Boolean);

    return keyParts.join(':');
  }
}
