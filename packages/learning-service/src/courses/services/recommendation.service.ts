// src/courses/services/recommendation.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CourseRecommendationDto,
  RecommendationResponseDto,
} from '../dto/recommendation.dto';
import { SkillGapDto } from '../dto/skill-gap.dto';
import { Course } from '../entity/courses.entity';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
  ) {
    // Log the collection name to verify
    this.logger.log(
      `Using collection: ${this.courseModel.collection.collectionName}`,
    );
  }

  async getRecommendations(
    skillGaps: SkillGapDto[],
  ): Promise<RecommendationResponseDto> {
    try {
      const recommendations: CourseRecommendationDto[] = [];

      for (const gap of skillGaps) {
        this.logger.debug(
          `Finding recommendations for skill: ${gap.skillName}`,
        );

        // Log the query parameters
        this.logger.debug(`Search parameters:`, {
          skillName: gap.skillName,
          currentLevel: gap.currentLevel,
          requiredLevel: gap.requiredLevel,
          careerLevel: gap.careerLevel,
        });

        const recommendation = await this.findRecommendedCourse(gap);
        if (recommendation) {
          recommendations.push(recommendation);
        }
      }

      if (recommendations.length === 0) {
        return {
          success: true,
          recommendations: [],
          message: 'No suitable courses found for the given skill gaps.',
        };
      }

      return {
        success: true,
        recommendations,
      };
    } catch (error) {
      this.logger.error(`Error getting recommendations: ${error.message}`);
      throw error;
    }
  }

  private async findRecommendedCourse(
    gap: SkillGapDto,
  ): Promise<CourseRecommendationDto | null> {
    try {
      // First try: Find exact match
      let course = await this.courseModel
        .findOne({
          skillName: gap.skillName,
          requiredLevel: gap.requiredLevel,
          careerLevel: gap.careerLevel,
        })
        .exec();

      // Log the exact match result
      this.logger.debug(`Exact match result:`, course);

      // Second try: Find course within level range
      if (!course) {
        course = await this.courseModel
          .findOne({
            skillName: gap.skillName,
            requiredLevel: {
              $gte: gap.currentLevel,
              $lte: gap.requiredLevel,
            },
          })
          .sort({ requiredLevel: -1 })
          .exec();

        // Log the range match result
        this.logger.debug(`Range match result:`, course);
      }

      // Third try: Find any course that could help progress
      if (!course) {
        course = await this.courseModel
          .findOne({
            skillName: gap.skillName,
            requiredLevel: { $gt: gap.currentLevel },
          })
          .sort({ requiredLevel: 1 })
          .exec();

        // Log the progression match result
        this.logger.debug(`Progression match result:`, course);
      }

      if (!course) {
        this.logger.warn(
          `No suitable course found for skill: ${gap.skillName}`,
        );
        return null;
      }

      // Map the course data to recommendation format
      const recommendation: CourseRecommendationDto = {
        skillName: gap.skillName,
        courseName: course.courseId, // Using courseId since that's what we have in the data
        provider: course.fields.find((f) => f.name === 'provider')?.value || '',
        duration: course.fields.find((f) => f.name === 'duration')?.value || '',
        format: course.fields.find((f) => f.name === 'format')?.value || '',
        prerequisites:
          course.fields.find((f) => f.name === 'prerequisites')?.value || '',
        learningObjectives:
          course.fields
            .find((f) => f.name === 'learningObjectives')
            ?.value?.split(',')
            .map((obj) => obj.trim()) || [],
      };

      return recommendation;
    } catch (error) {
      this.logger.error(
        `Error finding course recommendation: ${error.message}`,
      );
      throw error;
    }
  }
}
