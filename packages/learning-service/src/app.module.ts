import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtStrategy } from '@skills-base/shared';
import { CoursesController } from './courses/controllers/courses.controller';
import { RecommendationController } from './courses/controllers/recommendation.controller';
import { CoursesService } from './courses/services/courses.service';
import { RecommendationService } from './courses/services/recommendation.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Primary MongoDB connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    // Skills MongoDB connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_SKILLS_URI'),
      }),
      inject: [ConfigService],
      connectionName: 'MONGODB_SKILLS_URI',
    }),
  ],
  controllers: [CoursesController, RecommendationController],
  providers: [CoursesService, RecommendationService, JwtStrategy],
})
export class AppModule {}
