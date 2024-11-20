import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
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
