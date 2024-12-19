import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import {
  RecommendationDto,
  RecommendationResponseDto,
} from '../dto/recommendation.dto';
import { Course, CourseSchema } from '../entity/courses.entity';
import { RequiredSkills } from '../entity/required-skills.entity';

/**
 * Service for generating personalized learning recommendations based on skill gaps
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

  /**
   * Generates learning recommendations for an employee based on their skill gaps
   */
  async getRecommendations(
    email: string,
    authHeader: string,
  ): Promise<RecommendationResponseDto> {
    try {
      // Check cache first
      const cacheKey = `recommendation-${email}`;
      if (this.recommendationCache.has(cacheKey)) {
        return this.recommendationCache.get(cacheKey)!;
      }
      // Fetch and validate employee data
      const skillGapData = await this.fetchSkillGapData(email, authHeader);
      if (!skillGapData) {
        return this.createEmptyResponse();
      }
      // Get required skills for employee's level
      const requiredSkills = await this.findRequiredSkills(
        skillGapData.careerLevel,
        authHeader,
      );
      if (!requiredSkills?.requiredSkills) {
        return this.createEmptyResponse();
      }
      // Convert skills array to map of skill gaps
      const skillGaps = skillGapData.skills.reduce(
        (acc: Record<string, number>, skill: any) => {
          acc[skill.name] = skill.gap;
          return acc;
        },
        {},
      );
      // Generate recommendations based on gaps
      const recommendations = await this.processSkillGaps(
        skillGaps,
        skillGapData.careerLevel,
        requiredSkills.requiredSkills,
      );
      // Create and cache response
      const response: RecommendationResponseDto = {
        success: true,
        employeeName: skillGapData.name,
        careerLevel: skillGapData.careerLevel,
        recommendations,
        generatedDate: new Date(),
      };

      this.recommendationCache.set(cacheKey, response);
      return response;
    } catch (error: any) {
      this.logger.error(`Error getting recommendations: ${error.message}`);
      this.invalidateCache();
      throw error;
    }
  }
  /**
   * Fetches employee skill gap data from the skills service
   */
  private async fetchSkillGapData(
    email: string,
    authHeader: string,
  ): Promise<any> {
    const url = `${this.skillsServiceUrl}/skills-matrix/user?email=${encodeURIComponent(email)}`;
    const response = await fetch(url, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });

    return response.ok ? response.json() : null;
  }
  /**
   * Retrieves required skills for a career level with caching
   */
  private async findRequiredSkills(
    careerLevel: string,
    authHeader: string,
  ): Promise<RequiredSkills | null> {
    const cacheKey = `${careerLevel}-QA`;
    if (this.requiredSkillsCache.has(cacheKey)) {
      this.logger.debug(`Cache HIT`);
      return this.requiredSkillsCache.get(cacheKey)!;
    }
    this.logger.debug(`Cache MISS`);
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

      if (!response.ok) return null;

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
      return null;
    } catch (error: any) {
      this.logger.error(`Error fetching required skills: ${error.message}`);
      return null;
    }
  }
  /**
   * Processes skill gaps and finds matching course recommendations
   */
  private async processSkillGaps(
    skillGaps: Record<string, number>,
    careerLevel: string,
    requiredSkills: Record<string, number>,
  ): Promise<RecommendationDto[]> {
    const recommendations: RecommendationDto[] = [];
    // Get all courses and create lookup map
    const allCourses = await this.courseModel.find({}).exec();
    const courseMap = new Map(
      allCourses.map((course) => [
        `${course.skillName.toLowerCase().replace(/\s+/g, '')}-${course.careerLevel}`,
        course,
      ]),
    );
    // Normalize required skills for comparison
    const normalizedRequiredSkills = Object.fromEntries(
      Object.entries(requiredSkills).map(([key, value]) => [
        key.toLowerCase().replace(/\s+/g, ''),
        value,
      ]),
    );
    // Process each skill gap
    for (const [skillName, gap] of Object.entries(skillGaps)) {
      if (gap === 0) continue;

      const normalizedSkillName = skillName.toLowerCase().replace(/\s+/g, '');
      this.logger.debug(`Processing ${skillName} with gap ${gap}`);
      const requiredLevel = normalizedRequiredSkills[normalizedSkillName];

      if (requiredLevel === undefined) continue;

      const courseKey = `${normalizedSkillName}-${careerLevel}`;
      const course = courseMap.get(courseKey);

      if (course) {
        const currentLevel = course.requiredLevel - Math.abs(gap);
        recommendations.push({
          skillName,
          currentLevel: Number(currentLevel.toFixed(1)),
          targetLevel: course.requiredLevel,
          gap,
          type: gap < 0 ? 'skillGap' : 'promotion',
          course: {
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
          },
        });
      }
    }

    return recommendations.sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));
  }
  /**
   * Helper to get field value from course data
   */
  private getFieldValue(course: Course, fieldName: string): string {
    return course.fields.find((f) => f.name === fieldName)?.value || '';
  }
  /**
   * Clears all cached data
   */
  public invalidateCache(): void {
    this.requiredSkillsCache.clear();
    this.recommendationCache.clear();
  }
  /**
   * Creates empty response for cases where no recommendations can be generated
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
