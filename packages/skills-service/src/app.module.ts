import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule, JwtStrategy, LoggerMiddleware } from '@skills-base/shared';
import { AssessmentsModule } from './assessments/assessments.module';
import { TaxonomyModule } from './taxonomy/taxonomy.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    TaxonomyModule,
    AssessmentsModule,
  ],
  providers: [JwtStrategy]
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
