import { DynamicModule, Module, Provider } from '@nestjs/common';
import { CacheInvalidateInterceptor } from '../interceptors/cache-invalidate.interceptor';
import { RedisCacheInterceptor } from '../interceptors/redis-cache.interceptor';
import { RedisConfig } from '../interfaces/redis.interface';
import { RedisService } from '../services/redis.service';

@Module({})
export class RedisModule {
  static forRoot(config: RedisConfig): DynamicModule {
    const configProvider: Provider = {
      provide: 'REDIS_CONFIG',
      useValue: config,
    };

    return {
      module: RedisModule,
      providers: [
        configProvider,
        RedisService,
        RedisCacheInterceptor,
        CacheInvalidateInterceptor,
      ],
      exports: [RedisService],
      global: true,
    };
  }
}
