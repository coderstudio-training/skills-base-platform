import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import {
  INVALIDATE_CACHE_KEYS,
  CacheKeyGenerator,
} from '../decorators/cache-invalidator.decorator';
import { RedisService } from '../services/redis.service';
import { Logger } from '../services/logger.service';

@Injectable()
export class CacheInvalidateInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInvalidateInterceptor.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(async () => {
        try {
          const keysToInvalidate = this.reflector.get<
            string[] | CacheKeyGenerator
          >(INVALIDATE_CACHE_KEYS, context.getHandler());

          if (!keysToInvalidate) return;

          const keys =
            typeof keysToInvalidate === 'function'
              ? keysToInvalidate(context.getArgs())
              : keysToInvalidate;

          await this.redisService.invalidateMultiple(keys);

          this.logger.debug('Cache invalidated', {
            keys,
            handler: context.getHandler().name,
          });
        } catch (error) {
          this.logger.error('Cache invalidation failed', {
            error,
            handler: context.getHandler().name,
          });
        }
      }),
      catchError((error) => {
        this.logger.error('Error in handler with cache invalidation', {
          error,
          handler: context.getHandler().name,
        });
        return throwError(() => error);
      }),
    );
  }
}
