// src/courses/modules/recommendation.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecommendationController } from '../controllers/recommendation.controller';
import { Course, CourseSchema } from '../entity/courses.entity';
import { RecommendationService } from '../services/recommendation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Course.name,
        schema: CourseSchema,
        collection: 'QA_LEARNING_RESOURCES', // Specify the existing collection
      },
    ]),
  ],
  controllers: [RecommendationController],
  providers: [RecommendationService],
})
export class RecommendationModule {}
