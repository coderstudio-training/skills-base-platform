import { DynamicModule, Module, Provider } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RedisConfigurationManager } from '../config/redis.config';
import { CacheInvalidateInterceptor } from '../interceptors/cache-invalidate.interceptor';
import { RedisCacheInterceptor } from '../interceptors/redis-cache.interceptor';
import { RedisConfig } from '../interfaces/redis.interface';
import { RedisService } from '../services/redis.service';

@Module({})
export class RedisModule {
  static forRoot(config?: Partial<RedisConfig>): DynamicModule {
    const configManager = RedisConfigurationManager.getInstance();

    if (config) {
      configManager.updateConfig(config);
    }

    const providers: Provider[] = [
      RedisService,
      {
        provide: APP_INTERCEPTOR,
        useClass: RedisCacheInterceptor,
      },
      {
        provide: APP_INTERCEPTOR,
        useClass: CacheInvalidateInterceptor,
      },
    ];

    return {
      module: RedisModule,
      providers,
      exports: [RedisService],
      global: true,
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: RedisModule,
      providers: [RedisService],
      exports: [RedisService],
    };
  }
}
