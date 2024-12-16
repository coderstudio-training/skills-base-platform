import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { INVALIDATE_CACHE_KEYS } from '../decorators/cache-invalidator.decorator';
import { RedisService } from '../services/redis.service';

@Injectable()
export class CacheInvalidateInterceptor implements NestInterceptor {
  constructor(
    private readonly redisService: RedisService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(async () => {
        try {
          const keysToInvalidate = this.reflector.get(
            INVALIDATE_CACHE_KEYS,
            context.getHandler(),
          );

          if (!keysToInvalidate) return;

          const args = context.getArgs();
          const keys =
            typeof keysToInvalidate === 'function'
              ? keysToInvalidate(args)
              : keysToInvalidate;

          await this.redisService.invalidateMultiple(keys);
        } catch (error) {
          // Log error but don't fail the request
          console.error('Cache invalidation failed:', error);
        }
      }),
    );
  }
}
