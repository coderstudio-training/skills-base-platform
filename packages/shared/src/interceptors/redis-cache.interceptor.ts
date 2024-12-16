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
  CACHE_KEY_METADATA,
  CACHE_TTL_METADATA,
} from '../decorators/redis-cache.decorator';
import { Logger } from '../services/logger.service';
import { RedisService } from '../services/redis.service';

@Injectable()
export class RedisCacheInterceptor implements NestInterceptor {
  constructor(
    private readonly redisService: RedisService,
    private readonly reflector: Reflector,
    private readonly logger: Logger = new Logger('RedisCacheInterceptor'),
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const key = this.reflector.get(CACHE_KEY_METADATA, context.getHandler());
    const ttl = this.reflector.get(CACHE_TTL_METADATA, context.getHandler());

    if (!key) return next.handle();

    try {
      const cachedValue = await this.redisService.get(key);
      if (cachedValue) return of(JSON.parse(cachedValue));

      return next.handle().pipe(
        tap(async (response) => {
          await this.redisService.set(key, JSON.stringify(response), ttl);
        }),
      );
    } catch (error) {
      this.logger.error(error);
      return next.handle();
    }
  }
}
