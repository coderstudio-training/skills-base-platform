import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule, LoggerMiddleware } from '@skills-base/shared';
import { AuthModule } from '../../user-service/dist/auth/auth.module';
import { TaxonomyModule } from './taxonomy/taxonomy.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    TaxonomyModule,
    AuthModule,
  ],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
