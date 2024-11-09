import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CareerLevel } from '../career-level.enum';
import {
  CourseDetailsDto,
  RecommendationResponseDto,
} from '../dto/recommendation.dto';
import { Course } from '../entity/courses.entity';
import { SkillGap } from '../entity/skill-gap.entity';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(SkillGap.name, 'MONGODB_SKILLS_URI')
    private readonly skillGapsModel: Model<SkillGap>,
  ) {}

  async getRecommendations(email: string): Promise<RecommendationResponseDto> {
    try {
      const skillGap = await this.skillGapsModel
        .findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } })
        .sort({ computedDate: -1 })
        .exec();

      if (!skillGap) {
        this.logger.warn(`No skill gaps found for email: ${email}`);
        return {
          success: false,
          employeeName: '',
          careerLevel: '',
          recommendations: [],
          message: 'No skill gap data found for the employee',
          generatedDate: new Date(),
        };
      }

      const recommendations = await this.findCourseRecommendations(
        skillGap.skillGaps,
        skillGap.careerLevel,
      );

      return {
        success: true,
        employeeName: skillGap.name,
        careerLevel: skillGap.careerLevel,
        recommendations,
        generatedDate: new Date(),
      };
    } catch (error: any) {
      this.logger.error(`Error getting recommendations: ${error.message}`);
      throw error;
    }
  }

  private async findCourseRecommendations(
    skillGaps: Record<string, number>,
    careerLevel: string,
  ) {
    const recommendations = [];

    for (const [skillName, gap] of Object.entries(skillGaps)) {
      if (gap <= 0) {
        continue;
      }

      const formattedSkillName = this.formatSkillName(skillName);

      // First try with exact career level
      let course = await this.findMatchingCourse(
        formattedSkillName,
        careerLevel,
      );

      // If Professional IV and no course found, try Manager I
      if (!course && careerLevel === 'Professional IV') {
        course = await this.findMatchingCourse(formattedSkillName, 'Manager I');
      }

      if (course) {
        this.logger.debug(`Found matching course: ${course.courseId}`);

        const currentLevel = course.requiredLevel - gap;

        recommendations.push({
          skillName: formattedSkillName,
          currentLevel: Number(currentLevel.toFixed(1)),
          targetLevel: course.requiredLevel,
          gap,
          course: this.formatCourseDetails(course, currentLevel),
        });
      }
    }

    return recommendations.sort((a, b) => b.gap - a.gap);
  }

  private getRecommendedForValue(careerLevel: string): string {
    switch (careerLevel) {
      case CareerLevel.PROFESSIONAL_II:
        return 'Current Level < 3';
      case CareerLevel.PROFESSIONAL_III:
        return 'Current Level < 4';
      case CareerLevel.PROFESSIONAL_IV:
        return 'Current Level < 5';
      case CareerLevel.MANAGER_I:
      case CareerLevel.MANAGER_II:
      case CareerLevel.DIRECTOR_I:
      case CareerLevel.DIRECTOR_II:
      case CareerLevel.DIRECTOR_III:
      case CareerLevel.DIRECTOR_IV:
        return 'Current Level < 6';
      default:
        return 'Current Level < 5';
    }
  }

  private async findMatchingCourse(
    skillName: string,
    careerLevel: string,
  ): Promise<Course | null> {
    try {
      // First, try to find any courses matching the skill name
      const courses = await this.courseModel
        .find({
          skillName: {
            $regex: skillName
              .replace(/([A-Z])/g, ' $1')
              .trim()
              .replace(/\s+/g, '\\s+'),
            $options: 'i',
          },
        })
        .exec();

      if (courses.length > 0) {
        this.logger.debug(
          'Sample course:',
          JSON.stringify(courses[0], null, 2),
        );
      }

      // Then filter for career level and recommendedFor
      const recommendedFor = this.getRecommendedForValue(careerLevel);

      const query = {
        $and: [
          {
            skillName: {
              $regex: skillName
                .replace(/([A-Z])/g, ' $1')
                .trim()
                .replace(/\s+/g, '\\s+'),
              $options: 'i',
            },
          },
          { careerLevel },
          {
            fields: {
              $elemMatch: {
                name: 'recommendedFor',
                value: recommendedFor,
              },
            },
          },
        ],
      };

      const course = await this.courseModel.findOne(query).exec();

      if (!course) {
        // Try looser matching if exact match fails
        const looseQuery = {
          $and: [
            {
              skillName: {
                $regex: skillName
                  .replace(/([A-Z])/g, ' $1')
                  .trim()
                  .replace(/\s+/g, '.*'),
                $options: 'i',
              },
            },
            { careerLevel },
          ],
        };

        const looseCourse = await this.courseModel.findOne(looseQuery).exec();
        if (looseCourse) {
          this.logger.debug(
            'Found course with loose matching:',
            looseCourse.courseId,
          );
        }
        return looseCourse;
      }

      return course;
    } catch (error: any) {
      this.logger.error(
        `Error finding course for ${skillName}: ${error.message}`,
      );
      return null;
    }
  }

  private formatCourseDetails(
    course: Course,
    currentLevel: number,
  ): CourseDetailsDto {
    return {
      name: this.getFieldValue(course, 'courseName'),
      provider: this.getFieldValue(course, 'provider'),
      duration: this.getFieldValue(course, 'duration'),
      format: this.getFieldValue(course, 'format'),
      learningPath: `This course will help you progress from level ${currentLevel.toFixed(1)} to level ${course.requiredLevel}, which is appropriate for your career level.`,
      learningObjectives: this.getFieldValue(course, 'learningObjectives')
        .split(',')
        .map((obj) => obj.trim()),
      prerequisites: this.getFieldValue(course, 'prerequisites'),
      businessValue: this.getFieldValue(course, 'businessValue'),
    };
  }

  private getFieldValue(course: Course, fieldName: string): string {
    const field = course.fields.find((f) => f.name === fieldName);
    return field?.value || '';
  }

  private formatSkillName(camelCase: string): string {
    // Handle special cases first
    const formatted = camelCase
      .replace(/QE/g, 'Quality Engineering')
      .replace(/QA/g, 'Quality Assurance');

    // Then handle normal camelCase
    return formatted
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }
}
