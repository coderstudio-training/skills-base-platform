import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  CacheInvalidationContext,
  INVALIDATE_CACHE_CONDITION,
  INVALIDATE_CACHE_KEYS,
  INVALIDATE_CACHE_KEY_GENERATORS,
} from '../decorators/cache-invalidator.decorator';
import { Logger } from '../services/logger.service';
import { RedisService } from '../services/redis.service';

@Injectable()
export class CacheInvalidateInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInvalidateInterceptor.name);
  private readonly environment = process.env.NODE_ENV || 'development';

  constructor(
    private readonly redisService: RedisService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(async (response) => {
        try {
          const shouldInvalidate = await this.shouldInvalidateCache(
            context,
            response,
          );
          if (!shouldInvalidate) {
            return;
          }

          const keysToInvalidate = await this.getKeysToInvalidate(
            context,
            response,
          );

          if (keysToInvalidate.length === 0) {
            return;
          }

          // Add environment prefix to each key if it doesn't already have one
          const prefixedKeys = keysToInvalidate.map((key) =>
            key.startsWith(`${this.environment}:`)
              ? key
              : `${this.environment}:${key}`,
          );

          await this.redisService.invalidateMultiple(prefixedKeys);

          this.logger.debug('Cache invalidated', {
            keys: prefixedKeys,
            handler: context.getHandler().name,
          });
        } catch (error) {
          this.logger.error('Cache invalidation failed', {
            error,
            handler: context.getHandler().name,
          });
        }
      }),
    );
  }

  private async shouldInvalidateCache(
    context: ExecutionContext,
    response: any,
  ): Promise<boolean> {
    const condition = this.reflector.get(
      INVALIDATE_CACHE_CONDITION,
      context.getHandler(),
    );

    if (!condition) {
      return true;
    }

    try {
      const invalidationContext = this.createInvalidationContext(
        context,
        response,
      );
      return await condition(invalidationContext);
    } catch (error) {
      this.logger.error('Cache invalidation condition check failed', {
        error,
        handler: context.getHandler().name,
      });
      return false;
    }
  }

  private async getKeysToInvalidate(
    context: ExecutionContext,
    response: any,
  ): Promise<string[]> {
    const staticKeys =
      this.reflector.get<string[]>(
        INVALIDATE_CACHE_KEYS,
        context.getHandler(),
      ) || [];

    const keyGenerators =
      this.reflector.get<
        Array<
          (context: CacheInvalidationContext) => string[] | Promise<string[]>
        >
      >(INVALIDATE_CACHE_KEY_GENERATORS, context.getHandler()) || [];

    const invalidationContext = this.createInvalidationContext(
      context,
      response,
    );

    const dynamicKeysPromises = keyGenerators.map((generator) =>
      generator(invalidationContext),
    );

    const dynamicKeysArrays = await Promise.all(dynamicKeysPromises);
    const dynamicKeys = dynamicKeysArrays.flat();

    return [...new Set([...staticKeys, ...dynamicKeys])];
  }

  private createInvalidationContext(
    context: ExecutionContext,
    response: any,
  ): CacheInvalidationContext {
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
      response,
      args,
      executionContext: context,
    };
  }
}
