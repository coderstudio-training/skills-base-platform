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
  REDIS_CACHE_KEY_GENERATOR,
  REDIS_CACHE_KEY_METADATA,
  REDIS_CACHE_TTL_METADATA,
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

    const finalKey = keyGenerator
      ? keyGenerator(context.getArgs())
      : this.generateKey(key, context);

    try {
      const cachedValue = await this.redisService.get(finalKey);

      if (cachedValue) {
        this.logger.debug('Cache hit', {
          key: finalKey,
          handler: context.getHandler().name,
        });
        return of(JSON.parse(cachedValue));
      }

      this.logger.debug('Cache miss', {
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

  private generateKey(baseKey: string, context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();
    const params = request.params || {};
    const query = request.query || {};

    const keyParts = [
      baseKey,
      Object.values(params).join(':'),
      Object.values(query).join(':'),
    ].filter(Boolean);

    return keyParts.join(':');
  }
}
