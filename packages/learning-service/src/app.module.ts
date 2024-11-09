// src/app.module.ts
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
    // Primary connection - learning service
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    // Secondary connection - skills service
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_SKILLS_URI'),
      }),
      inject: [ConfigService],
      connectionName: 'MONGODB_SKILLS_URI',
    }),
    DatabaseModule,
    CoursesModule,
    RecommendationModule,
  ],
})
export class AppModule {}
