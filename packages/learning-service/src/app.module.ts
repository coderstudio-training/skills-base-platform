import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from '@skills-base/shared';
import { CoursesModule } from './courses/modules/courses.module';
import { RecommendationModule } from './courses/modules/recommendation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
    // LoggerMiddleware,
    CoursesModule,
    RecommendationModule,
  ],
  // Remove controllers and providers as we're not using AppController and AppService
})
export class AppModule {}
