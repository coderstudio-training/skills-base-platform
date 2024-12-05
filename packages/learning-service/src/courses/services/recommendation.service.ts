import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import {
  CourseDetailsDto,
  RecommendationDto,
  RecommendationResponseDto,
} from '../dto/recommendation.dto';
import { Course, CourseSchema } from '../entity/courses.entity';
import {
  RequiredSkills,
  RequiredSkillsSchema,
} from '../entity/required-skills.entity';
import { SkillGap, SkillGapSchema } from '../entity/skill-gap.entity';

/**
 * Service responsible for generating personalized learning recommendations
 * based on employee skill gaps and career levels.
 * Integrates data from multiple collections across different databases.
 */

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);
  private courseModel: Model<Course>;
  private skillGapsModel: Model<SkillGap>;
  private requiredSkillsModel: Model<RequiredSkills>;
  private requiredSkillsCache = new Map<string, RequiredSkills>();

  /**
   * Initializes the service with connections to multiple MongoDB databases
   * and sets up the required models for courses, skill gaps, and required skills.
   *
   * @param defaultConnection - Primary MongoDB connection
   * @param skillsConnection - Secondary MongoDB connection for skills data
   */
  constructor(
    @InjectConnection() private readonly defaultConnection: Connection,
    @InjectConnection('MONGODB_SKILLS_URI')
    private readonly skillsConnection: Connection,
  ) {
    // Initialize models
    this.courseModel = this.defaultConnection.model<Course>(
      'Course',
      CourseSchema,
      'QA_LEARNING_RESOURCES',
    );

    this.skillGapsModel = this.skillsConnection.model<SkillGap>(
      'SkillGap',
      SkillGapSchema,
      'Capability_gapAssessments',
    );

    this.requiredSkillsModel = this.skillsConnection.model<RequiredSkills>(
      'RequiredSkills',
      RequiredSkillsSchema,
      'capabilityRequiredSkills',
    );
  }
  /**
   * Generates personalized learning recommendations for an employee.
   * Process includes:
   * 1. Retrieving employee's skill gap data
   * 2. Getting required skills for their career level
   * 3. Finding matching courses for skill gaps
   * 4. Generating recommendations based on gaps and available courses
   *
   * @param email - Employee's email address
   * @returns Promise resolving to recommendations response
   */
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
  /**
   * Retrieves the most recent skill gap assessment for an employee.
   * Uses case-insensitive email matching.
   *
   * @param email - Employee's email address
   * @returns Promise resolving to skill gap data or null if not found
   */
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
  /**
   * Finds required skills for a specific career level.
   * Currently hardcoded to 'QA' capability becaus of limited data, but should be made configurable in the future.
   *
   * @param careerLevel - Career level to find required skills for
   * @returns Promise resolving to required skills or null if not found
   */
  private async findRequiredSkills(
    careerLevel: string,
  ): Promise<RequiredSkills | null> {
    const cacheKey = `${careerLevel}-QA`;
    if (this.requiredSkillsCache.has(cacheKey)) {
      return this.requiredSkillsCache.get(cacheKey)!;
    }

    this.logger.debug(
      `Finding required skills for career level: ${careerLevel}`,
    );

    const requiredSkills = await this.requiredSkillsModel
      .findOne({
        careerLevel,
        capability: 'QA',
      })
      .exec();

    if (requiredSkills) {
      this.requiredSkillsCache.set(cacheKey, requiredSkills);
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

  /**
   * Processes skill gaps to generate course recommendations.
   * Matches skills with appropriate courses based on career level and required skill level.
   *
   * @param skillGaps - Current skill levels mapped to skill names
   * @param careerLevel - Employee's career level
   * @param requiredSkills - Required skill levels mapped to skill names
   * @returns Promise resolving to array of recommendations
   */
  private async processSkillGaps(
    skillGaps: Record<string, number>,
    careerLevel: string,
    requiredSkills: Record<string, number>,
  ): Promise<RecommendationDto[]> {
    const recommendations: RecommendationDto[] = [];

    const formattedSkillNames = Object.keys(skillGaps).map((skillName) =>
      this.formatSkillName(skillName),
    );

    const matchingCourses = await this.courseModel
      .find({
        $and: [
          {
            skillName: {
              $in: formattedSkillNames.map(
                (name) =>
                  new RegExp(
                    name
                      .replace(/([A-Z])/g, ' $1')
                      .trim()
                      .replace(/\s+/g, '\\s+'),
                    'i',
                  ),
              ),
            },
          },
          { careerLevel },
        ],
      })
      .exec();

    const courseMap = new Map(
      matchingCourses.map((course) => [course.skillName.toLowerCase(), course]),
    );

    for (const [skillName, gap] of Object.entries(skillGaps)) {
      try {
        const formattedSkillName = this.formatSkillName(skillName);
        this.logger.debug(`Processing ${formattedSkillName} with gap ${gap}`);

        const requiredLevel = requiredSkills[skillName];

        if (requiredLevel !== undefined) {
          this.logger.debug(
            `Required level for ${skillName}: ${requiredLevel}`,
          );

          const course = courseMap.get(formattedSkillName.toLowerCase());

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
  /**
   * Creates a recommendation based on skill gap and matching course.
   * Only creates recommendations for non-zero gaps.
   */
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
  /**
   * Formats course details into a standardized DTO structure.
   * Extracts values from dynamic course fields.
   */
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
  /**
   * Helper function to safely extract field values from course data.
   * Returns empty string if field is not found.
   */
  private getFieldValue(course: Course, fieldName: string): string {
    const field = course.fields.find((f) => f.name === fieldName);
    return field?.value || '';
  }
  /**
   * Formats skill names by replacing abbreviations and adding spaces.
   * Handles special cases like 'QE' and 'QA'.
   */
  private formatSkillName(camelCase: string): string {
    const formatted = camelCase
      .replace(/QE/g, 'Quality Engineering')
      .replace(/QA/g, 'Quality Assurance');

    return formatted
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }
  /**
   * Creates an empty response for cases where no recommendations can be generated.
   * Used when no skill gap data is found or when required skills are missing.
   */
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
