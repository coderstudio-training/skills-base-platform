import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CourseDetailsDto,
  RecommendationDto,
  RecommendationResponseDto,
} from '../dto/recommendation.dto';
import { Course } from '../entity/courses.entity';
import { RequiredSkills } from '../entity/required-skills.entity';
import { SkillGap } from '../entity/skill-gap.entity';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(SkillGap.name, 'MONGODB_SKILLS_URI')
    private readonly skillGapsModel: Model<SkillGap>,
    @InjectModel(RequiredSkills.name, 'MONGODB_SKILLS_URI')
    private readonly requiredSkillsModel: Model<RequiredSkills>,
  ) {}

  async getRecommendations(email: string): Promise<RecommendationResponseDto> {
    try {
      // Step 1: Get skill gap data
      const skillGap = await this.findLatestSkillGap(email);
      if (!skillGap) {
        return this.createEmptyResponse();
      }

      // Step 2: Get required skills for career level
      const requiredSkills = await this.findRequiredSkills(
        skillGap.careerLevel,
      );
      if (!requiredSkills) {
        this.logger.warn(
          `No required skills found for career level: ${skillGap.careerLevel}`,
        );
        return this.createEmptyResponse();
      }

      // Step 3: Find matching courses for each skill gap
      const recommendations = await this.processSkillGaps(
        skillGap.skillGaps,
        skillGap.careerLevel,
        requiredSkills.requiredSkills,
      );

      // Step 4: Return combined response
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

  private async findLatestSkillGap(email: string): Promise<SkillGap | null> {
    const skillGap = await this.skillGapsModel
      .findOne({ emailAddress: { $regex: new RegExp(`^${email}$`, 'i') } })
      .sort({ computedDate: -1 })
      .exec();

    if (!skillGap) {
      this.logger.warn(`No skill gaps found for email: ${email}`);
      return null;
    }

    return skillGap;
  }

  private async findRequiredSkills(
    careerLevel: string,
  ): Promise<RequiredSkills | null> {
    this.logger.debug(
      `Finding required skills for career level: ${careerLevel}`,
    );
    const requiredSkills = await this.requiredSkillsModel
      .findOne({
        careerLevel,
        capability: 'QA', //  make this configurable
      })
      .exec();

    if (requiredSkills) {
      this.logger.debug(
        `Found required skills: ${JSON.stringify(requiredSkills.requiredSkills)}`,
      );
    } else {
      this.logger.warn(
        `No required skills found for career level: ${careerLevel}`,
      );
    }

    return requiredSkills;
  }

  private async processSkillGaps(
    skillGaps: Record<string, number>, // Current Skills
    careerLevel: string, // Career Level
    requiredSkills: Record<string, number>, // Required Skills
  ): Promise<RecommendationDto[]> {
    const recommendations: RecommendationDto[] = [];

    for (const [skillName, gap] of Object.entries(skillGaps)) {
      try {
        const formattedSkillName = this.formatSkillName(skillName);
        this.logger.debug(`Processing ${formattedSkillName} with gap ${gap}`);

        // Get required level for this skill
        const requiredLevel = requiredSkills[skillName];

        if (requiredLevel !== undefined) {
          this.logger.debug(
            `Required level for ${skillName}: ${requiredLevel}`,
          );

          // Find matching course
          const course = await this.findMatchingCourse(
            formattedSkillName,
            careerLevel,
            requiredLevel,
          );

          if (course) {
            const recommendation = await this.createRecommendation(
              formattedSkillName,
              gap,
              course,
            );
            if (recommendation) {
              recommendations.push(recommendation);
            }
          } else {
            this.logger.debug(`No matching course found for ${skillName}`);
          }
        } else {
          this.logger.debug(`No required level found for skill: ${skillName}`);
        }
      } catch (error: any) {
        this.logger.error(
          `Error processing skill ${skillName}: ${error.message}`,
        );
      }
    }

    return recommendations.sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));
  }

  private async findMatchingCourse(
    skillName: string,
    careerLevel: string,
    requiredLevel: number,
  ): Promise<Course | null> {
    // Step 1: Try exact match with required level
    const exactMatch = await this.findExactMatchCourse(
      skillName,
      careerLevel,
      requiredLevel,
    );
    if (exactMatch) {
      return exactMatch;
    }

    // Step 2: Try loose match if exact match fails
    return this.findLooseMatchCourse(skillName, careerLevel);
  }

  private async findExactMatchCourse(
    skillName: string,
    careerLevel: string,
    requiredLevel: number,
  ): Promise<Course | null> {
    return this.courseModel
      .findOne({
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
          { requiredLevel },
        ],
      })
      .exec();
  }
  // still optional
  private async findLooseMatchCourse(
    skillName: string,
    careerLevel: string,
  ): Promise<Course | null> {
    return this.courseModel
      .findOne({
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
      })
      .exec();
  }

  private async createRecommendation(
    skillName: string,
    gap: number,
    course: Course,
  ): Promise<RecommendationDto | null> {
    const currentLevel = course.requiredLevel - Math.abs(gap);

    if (gap !== 0) {
      return {
        skillName,
        currentLevel: Number(currentLevel.toFixed(1)),
        targetLevel: course.requiredLevel,
        gap,
        type: gap < 0 ? 'skillGap' : 'promotion',
        course: this.formatCourseDetails(course, currentLevel),
      };
    }

    return null;
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
      learningPath: `This course will help you progress from level ${currentLevel.toFixed(
        1,
      )} to level ${course.requiredLevel}, which is appropriate for your career level.`,
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
    const formatted = camelCase
      .replace(/QE/g, 'Quality Engineering')
      .replace(/QA/g, 'Quality Assurance');

    return formatted
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  private createEmptyResponse(): RecommendationResponseDto {
    return {
      success: false,
      employeeName: '',
      careerLevel: '',
      recommendations: [],
      message: 'No skill gap data found for the employee',
      generatedDate: new Date(),
    };
  }
}
