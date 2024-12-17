import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import {
  CourseDetailsDto,
  RecommendationDto,
  RecommendationResponseDto,
} from '../dto/recommendation.dto';
import { Course, CourseSchema } from '../entity/courses.entity';
import { RequiredSkills } from '../entity/required-skills.entity';

/**
 * Service responsible for generating personalized learning recommendations
 * based on employee skill gaps and career levels.
 * Integrates data from multiple collections across different databases.
 */

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);
  private courseModel: Model<Course>;
  private readonly skillsServiceUrl: string;
  private requiredSkillsCache = new Map<string, RequiredSkills>();
  private readonly recommendationCache = new Map<
    string,
    RecommendationResponseDto
  >();

  constructor(@InjectConnection() private readonly connection: Connection) {
    this.skillsServiceUrl =
      process.env.SKILLS_SERVICE_HOST || 'http://localhost:3002';
    this.courseModel = this.connection.model<Course>(
      'Course',
      CourseSchema,
      'qa_courses',
    );
  }

  async getRecommendations(
    email: string,
    authHeader: string,
  ): Promise<RecommendationResponseDto> {
    try {
      // Check if the recommendation is already cached
      const cacheKey = `recommendation-${email}`;
      if (this.recommendationCache.has(cacheKey)) {
        this.logger.debug('Recommendation data found in cache');
        return this.recommendationCache.get(cacheKey)!;
      }

      // Fetch skill gap data
      const skillGapData = await this.fetchSkillGapData(email, authHeader);

      if (!skillGapData) {
        return this.createEmptyResponse();
      }

      // Get required skills with caching
      const requiredSkills = await this.findRequiredSkills(
        skillGapData.careerLevel,
        authHeader,
      );
      if (!requiredSkills || !requiredSkills.requiredSkills) {
        this.logger.warn(
          `No required skills found for career level: ${skillGapData.careerLevel}`,
        );
        return this.createEmptyResponse();
      }

      // Transform skills array into Record<string, number> format
      const skillGaps = skillGapData.skills.reduce(
        (acc: Record<string, number>, skill: any) => {
          acc[skill.name] = skill.gap;
          return acc;
        },
        {},
      );

      // Find matching courses for each skill gap
      const recommendations = await this.processSkillGaps(
        skillGaps,
        skillGapData.careerLevel,
        requiredSkills.requiredSkills,
      );

      // Create the response object and cache it
      const response: RecommendationResponseDto = {
        success: true,
        employeeName: skillGapData.name,
        careerLevel: skillGapData.careerLevel,
        recommendations,
        generatedDate: new Date(),
      };

      this.recommendationCache.set(cacheKey, response);
      this.logger.debug('Recommendation data cached');

      return response;
    } catch (error: any) {
      this.logger.error(`Error getting recommendations: ${error.message}`);
      this.invalidateCache();
      throw error;
    }
  }

  private async fetchSkillGapData(
    email: string,
    authHeader: string,
  ): Promise<any> {
    const url = `${this.skillsServiceUrl}/skills-matrix/user?email=${encodeURIComponent(email)}`;
    this.logger.debug(`Calling skills service at: ${url}`);

    const response = await fetch(url, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      this.logger.warn(`Failed to fetch skill gap data: ${response.status}`);
      return null;
    }

    return await response.json();
  }

  private async findRequiredSkills(
    careerLevel: string,
    authHeader: string, // Add auth header parameter
  ): Promise<RequiredSkills | null> {
    const cacheKey = `${careerLevel}-QA`;
    if (this.requiredSkillsCache.has(cacheKey)) {
      this.logger.debug(`Cache HIT: Required skills for ${careerLevel}`);
      return this.requiredSkillsCache.get(cacheKey)!;
    }
    this.logger.debug(
      `Cache MISS: Fetching required skills for ${careerLevel}`,
    );

    try {
      const response = await fetch(
        `${this.skillsServiceUrl}/api/skills-assessments/required-skills?capability=QA`,
        {
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        this.logger.warn(`Failed to fetch required skills: ${response.status}`);
        return null;
      }

      const allSkills = await response.json();
      const matchingSkills = allSkills.find(
        (skill: any) => skill.careerLevel === careerLevel,
      );

      if (matchingSkills) {
        const requiredSkills = {
          capability: matchingSkills.capability,
          careerLevel: matchingSkills.careerLevel,
          requiredSkills: matchingSkills.requiredSkills,
        } as RequiredSkills;

        this.requiredSkillsCache.set(cacheKey, requiredSkills);
        return requiredSkills;
      }

      this.logger.warn(
        `No required skills found for career level: ${careerLevel}`,
      );
      return null;
    } catch (error: any) {
      this.logger.error(`Error fetching required skills: ${error.message}`);
      return null;
    }
  }

  public invalidateCache(): void {
    this.requiredSkillsCache.clear();
    this.recommendationCache.clear();
    this.logger.debug('Required skills cache has been invalidated');
  }

  private async processSkillGaps(
    skillGaps: Record<string, number>,
    careerLevel: string,
    requiredSkills: Record<string, number>,
  ): Promise<RecommendationDto[]> {
    const recommendations: RecommendationDto[] = [];

    // Fetch all courses in a single query
    const allCourses = await this.courseModel.find({}).exec();

    // Create a map of courses for efficient lookup
    const courseMap = new Map(
      allCourses.map((course) => [
        `${course.skillName.toLowerCase().replace(/\s+/g, '')}-${course.careerLevel}`,
        course,
      ]),
    );

    // Create a normalized map of required skills
    const normalizedRequiredSkills = Object.fromEntries(
      Object.entries(requiredSkills).map(([key, value]) => [
        key.toLowerCase().replace(/\s+/g, ''),
        value,
      ]),
    );

    for (const [skillName, gap] of Object.entries(skillGaps)) {
      try {
        const normalizedSkillName = skillName.toLowerCase().replace(/\s+/g, '');
        this.logger.debug(`Processing ${skillName} with gap ${gap}`);

        const requiredLevel = normalizedRequiredSkills[normalizedSkillName];

        if (requiredLevel !== undefined) {
          this.logger.debug(
            `Required level for ${skillName}: ${requiredLevel}`,
          );

          if (gap !== 0) {
            const courseKey = `${normalizedSkillName}-${careerLevel}`;
            const course = courseMap.get(courseKey);

            if (course) {
              const recommendation = await this.createRecommendation(
                skillName,
                gap,
                course,
              );
              if (recommendation) {
                recommendations.push(recommendation);
              }
            } else {
              this.logger.debug(`No matching course found for ${skillName}`);
            }
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
