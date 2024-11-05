import { Module, DynamicModule } from '@nestjs/common';
import { APP_GUARD, APP_PIPE, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { SecurityConfig } from './interfaces/security-config.interface';
import { SecurityService } from './security.service';
import { XssValidationPipe } from './pipes/xss-validation.pipe';
import { MongoSanitizePipe } from './pipes/mongo-sanitize.pipe';
import { GlobalValidationPipe } from './pipes/global-validation.pipe';
import { SecurityInterceptor } from './interceptors/security.interceptor';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

@Module({})
export class SecurityModule {
  static forRoot(config: SecurityConfig): DynamicModule {
    return {
      module: SecurityModule,
      imports: [
        ThrottlerModule.forRoot([
          {
            ttl: config.rateLimit?.ttl ?? 60000, // Use nullish coalescing operator to provide a default value
            limit: config.rateLimit?.limit ?? 100,
          },
        ]),
      ],
      providers: [
        SecurityService,
        {
          provide: APP_PIPE,

          useFactory: () =>
            new GlobalValidationPipe({
              transform: true,
              whitelist: true,
              forbidNonWhitelisted: true,
              ...config.validation,
            }),
        },
        {
          provide: APP_PIPE,
          useClass: XssValidationPipe,
        },
        {
          provide: APP_PIPE,
          useClass: MongoSanitizePipe,
        },
        {
          provide: APP_GUARD,
          useClass: ThrottlerGuard,
        },
        {
          provide: APP_INTERCEPTOR,
          useClass: SecurityInterceptor,
        },
        {
          provide: APP_FILTER,
          useClass: AllExceptionsFilter,
        },
      ],
      exports: [SecurityService],
    };
  }
}
