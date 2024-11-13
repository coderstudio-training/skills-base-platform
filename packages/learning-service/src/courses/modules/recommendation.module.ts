import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecommendationController } from '../controllers/recommendation.controller';
import { Course, CourseSchema } from '../entity/courses.entity';
import { SkillGap, SkillGapSchema } from '../entity/skill-gap.entity';
import { RecommendationService } from '../services/recommendation.service';

@Module({
  imports: [
    // Mongoose connection for Course (default connection)
    MongooseModule.forFeature([
      {
        name: Course.name,
        schema: CourseSchema,
        collection: 'QA_LEARNING_RESOURCES',
      },
    ]),

    // Mongoose connection for SkillGap (MONGODB_SKILLS_URI connection)
    MongooseModule.forFeature(
      [
        {
          name: SkillGap.name,
          schema: SkillGapSchema,
          collection: 'Capability_gapAssessments',
        },
      ],
      'MONGODB_SKILLS_URI', // Ensure this connection name matches the one configured in AppModule
    ),
  ],
  controllers: [RecommendationController],
  providers: [RecommendationService],
})
export class RecommendationModule {}
