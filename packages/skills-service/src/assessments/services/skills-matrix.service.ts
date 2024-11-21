import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import {
  AdminSkillAnalyticsDto,
  SkillGapDto,
  TopSkillDto,
} from '../dto/computation.dto';
import { SkillGapsDto } from '../dto/user-skills.dto';
import { transformToReadableKeys } from '../utils/transform-keys.util';

export enum SkillCategory {
  TECHNICAL = 'Technical Skills',
  SOFT = 'Soft Skills',
}

export interface TransformedSkillDto {
  skill: string;
  category: SkillCategory;
  selfRating: number;
  managerRating: number;
  requiredRating: number;
  gap: number;
  average: number;
}

export interface TransformedSkillsResponseDto {
  employeeInfo: {
    email: string;
    name: string;
    careerLevel: string;
    capability: string;
  };
  skills: TransformedSkillDto[];
}

@Injectable()
export class SkillsMatrixService {
  private readonly logger = new Logger(SkillsMatrixService.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async getAdminSkillsAnalytics(): Promise<AdminSkillAnalyticsDto> {
    try {
      const allEmployeesData = await this.getAllEmployeesSkillsData();

      // Collect all unique skills
      const skillsMap = new Map<
        string,
        {
          totalRating: number;
          count: number;
          category: string;
          gapCount: number;
          totalGap: number;
          requiredLevel: number;
          currentLevel: number;
        }
      >();

      // Process all employees' skills
      allEmployeesData.forEach((employee) => {
        employee.skills.forEach((skill) => {
          const currentSkill = skillsMap.get(skill.skill) || {
            totalRating: 0,
            count: 0,
            category: skill.category,
            gapCount: 0,
            totalGap: 0,
            requiredLevel: skill.requiredRating,
            currentLevel: skill.average,
          };

          currentSkill.totalRating += skill.average;
          currentSkill.count += 1;

          if (skill.gap < 0) {
            currentSkill.gapCount += 1;
            currentSkill.totalGap += Math.abs(skill.gap);
          }

          skillsMap.set(skill.skill, currentSkill);
        });
      });

      // Transform to match frontend DTOs
      const topSkills: TopSkillDto[] = Array.from(skillsMap.entries())
        .map(([name, data]) => ({
          name,
          prevalence: (data.totalRating / (data.count * 5)) * 100, // Convert to percentage based on max rating of 5
        }))
        .sort((a, b) => b.prevalence - a.prevalence)
        .slice(0, 5);

      const skillGaps: SkillGapDto[] = Array.from(skillsMap.entries())
        .map(([name, data]) => {
          const currentLevel = data.totalRating / data.count;
          const requiredLevel = data.requiredLevel;
          const gap = Math.max(0, requiredLevel - currentLevel);

          return {
            name,
            currentLevel,
            requiredLevel,
            gap,
          };
        })
        .filter((gap) => gap.gap > 0)
        .sort((a, b) => b.gap - a.gap)
        .slice(0, 5);

      return {
        topSkills,
        skillGaps,
      };
    } catch (error) {
      this.logger.error('Error calculating admin skills analytics:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  async getAllEmployeesSkillsData(): Promise<TransformedSkillsResponseDto[]> {
    try {
      // Fetch all employees data in parallel
      const [gapAssessments, selfAssessments, managerAssessments] =
        await Promise.all([
          this.connection
            .collection('Capability_gapAssessments')
            .find()
            .toArray(),
          this.connection
            .collection('Capability_selfAssessments')
            .find()
            .toArray(),
          this.connection
            .collection('Capability_managerAssessments')
            .find()
            .toArray(),
        ]);

      // Create lookup maps for faster access
      const selfSkillsMap = new Map(
        selfAssessments.map((assessment) => [
          assessment.emailAddress,
          transformToReadableKeys(assessment.skills || {}),
        ]),
      );

      const managerSkillsMap = new Map(
        managerAssessments.map((assessment) => [
          assessment.emailOfResource,
          transformToReadableKeys(assessment.skills || {}),
        ]),
      );

      // Process each employee's data
      this.logger.debug(
        `Processing skills data for ${gapAssessments.length} employees`,
      );

      return gapAssessments.map((staff) => {
        const email = staff.emailAddress;
        return this.transformEmployeeSkills({
          staff: {
            emailAddress: staff.emailAddress,
            nameOfResource: staff.nameOfResource,
            careerLevel: staff.careerLevel,
            capability: staff.capability,
            skillAverages: transformToReadableKeys(staff.skillAverages || {}),
            skillGaps: transformToReadableKeys(staff.skillGaps || {}),
          },
          selfSkills: selfSkillsMap.get(email) || {},
          managerSkills: managerSkillsMap.get(email) || {},
        });
      });
    } catch (error) {
      this.logger.error('Error fetching skills data:', error);
      throw error;
    }
  }

  private transformEmployeeSkills(data: {
    staff: SkillGapsDto;
    selfSkills: Record<string, number>;
    managerSkills: Record<string, number>;
  }): TransformedSkillsResponseDto {
    const { staff, selfSkills, managerSkills } = data;
    const { skillAverages, skillGaps } = staff;

    const transformedSkills = Object.keys(skillAverages)
      .map((skill) => {
        const currentSkillGap = skillGaps[skill] || 0;
        const averageSkill = skillAverages[skill] || 0;
        const requiredRating = this.calculateRequiredRating(
          averageSkill,
          currentSkillGap,
        );

        return {
          skill,
          category: this.determineSkillCategory(skill),
          selfRating: selfSkills[skill] || 0,
          managerRating: managerSkills[skill] || 0,
          requiredRating,
          gap: currentSkillGap,
          average: averageSkill,
        };
      })
      .sort(this.sortSkills);

    return {
      employeeInfo: {
        email: staff.emailAddress,
        name: staff.nameOfResource,
        careerLevel: staff.careerLevel,
        capability: staff.capability,
      },
      skills: transformedSkills,
    };
  }

  private calculateRequiredRating(average: number, gap: number): number {
    if (gap > 0) return average - gap;
    if (gap < 0) return average + gap;
    return average;
  }

  private determineSkillCategory(skill: string): SkillCategory {
    const technicalKeywords = [
      'Testing',
      'Development',
      'Engineering',
      'Management',
      'Analysis',
      'Assurance',
      'Standards',
      'Synthesis',
      'Optimization',
    ];
    return technicalKeywords.some((keyword) => skill.includes(keyword))
      ? SkillCategory.TECHNICAL
      : SkillCategory.SOFT;
  }

  private sortSkills(a: TransformedSkillDto, b: TransformedSkillDto): number {
    if (a.category === b.category) {
      return a.skill.localeCompare(b.skill);
    }
    return a.category === SkillCategory.TECHNICAL ? -1 : 1;
  }
}
