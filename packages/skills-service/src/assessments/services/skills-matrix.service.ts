import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import {
  AdminSkillAnalyticsDto,
  SkillGapDto,
  TopSkillDto,
} from '../dto/computation.dto';
import {
  BusinessUnitDistributionDto,
  DistributionsResponseDto,
  SkillStatus,
} from '../dto/distributions.dto';
import {
  EmployeeRankingsResponseDto,
  SkillGapsDto,
} from '../dto/user-skills.dto';
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

interface EmployeeScore {
  name: string;
  email: string;
  score: number;
  skillCount: number;
  department: string;
  ranking?: number; // Add ranking as optional property
}

@Injectable()
export class SkillsMatrixService {
  private readonly logger = new Logger(SkillsMatrixService.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async getEmployeeRankings(): Promise<EmployeeRankingsResponseDto> {
    try {
      const allEmployeesData = await this.getAllEmployeesSkillsData();

      // Calculate average scores for each employee
      const employeeScores: EmployeeScore[] = allEmployeesData.map(
        (employee) => {
          const validSkills = employee.skills.filter(
            (skill) =>
              skill.average > 0 ||
              skill.selfRating > 0 ||
              skill.managerRating > 0,
          );

          const totalScore = validSkills.reduce(
            (sum, skill) => sum + skill.average,
            0,
          );
          const averageScore =
            validSkills.length > 0
              ? Number((totalScore / validSkills.length).toFixed(1))
              : 0;

          return {
            name: employee.employeeInfo.name,
            email: employee.employeeInfo.email,
            score: averageScore,
            skillCount: validSkills.length,
            department: employee.employeeInfo.capability,
          };
        },
      );

      // Sort employees
      const sortedEmployees = employeeScores.sort((a, b) => {
        const scoreDiff = b.score - a.score;
        if (scoreDiff !== 0) return scoreDiff;

        const skillCountDiff = b.skillCount - a.skillCount;
        if (skillCountDiff !== 0) return skillCountDiff;

        return a.name.localeCompare(b.name);
      });

      // Assign continuous rankings and take only top 5
      const sortedScores = sortedEmployees
        .slice(0, 5) // Take only the first 5 employees
        .map((employee, index) => ({
          name: employee.name,
          ranking: index + 1,
          score: employee.score,
        }));

      return {
        rankings: sortedScores,
      };
    } catch (error) {
      this.logger.error('Error calculating employee rankings:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  async getDistributions(): Promise<DistributionsResponseDto> {
    try {
      const allEmployeesData = await this.getAllEmployeesSkillsData();

      // Maps for tracking distributions by business unit
      const businessUnitMap = new Map<string, Map<string, Set<string>>>();
      const skillUserMap = new Map<
        string,
        {
          users: Set<string>;
          totalGap: number;
          category: SkillCategory;
          businessUnit: string;
        }
      >();
      const gradeMap = new Map<string, number>();

      // Process each employee's data
      for (const employee of allEmployeesData) {
        // Track grade distribution
        const grade = employee.employeeInfo.careerLevel;
        gradeMap.set(grade, (gradeMap.get(grade) || 0) + 1);

        const businessUnit = employee.employeeInfo.capability;

        // Initialize business unit map if not exists
        if (!businessUnitMap.has(businessUnit)) {
          businessUnitMap.set(businessUnit, new Map());
        }
        const categoryMap = businessUnitMap.get(businessUnit)!;

        // Process each skill
        employee.skills.forEach((skill) => {
          // Track skills by category within business unit
          const category = skill.category;
          if (!categoryMap.has(category)) {
            categoryMap.set(category, new Set());
          }
          categoryMap.get(category)?.add(skill.skill);

          // Track users and gaps per skill
          const skillKey = `${businessUnit}:${skill.skill}`;
          if (!skillUserMap.has(skillKey)) {
            skillUserMap.set(skillKey, {
              users: new Set(),
              totalGap: 0,
              category,
              businessUnit,
            });
          }

          const skillData = skillUserMap.get(skillKey)!;
          skillData.users.add(employee.employeeInfo.email);

          if (skill.gap < 0) {
            skillData.totalGap += Math.abs(skill.gap);
          }
        });
      }

      // Transform data for response
      const skillDistribution: BusinessUnitDistributionDto[] = Array.from(
        businessUnitMap.entries(),
      )
        .map(([businessUnit, categoryMap]) => ({
          businessUnit,
          categories: Array.from(categoryMap.entries())
            .map(([category, skills]) => ({
              category,
              skills: Array.from(skills)
                .map((skillName) => {
                  const skillKey = `${businessUnit}:${skillName}`;
                  const skillData = skillUserMap.get(skillKey)!;
                  const averageGap = skillData.totalGap / skillData.users.size;

                  return {
                    name: skillName,
                    userCount: skillData.users.size,
                    status: this.determineSkillStatus(
                      averageGap,
                      skillData.users.size,
                    ),
                  };
                })
                .sort((a, b) => b.userCount - a.userCount), // Sort by user count
            }))
            .sort((a, b) => a.category.localeCompare(b.category)), // Sort categories alphabetically
        }))
        .sort((a, b) => a.businessUnit.localeCompare(b.businessUnit)); // Sort business units

      const gradeDistribution = Array.from(gradeMap.entries())
        .map(([grade, userCount]) => ({
          grade,
          userCount,
        }))
        .sort((a, b) => {
          // Custom sort for grade levels
          const gradeOrder = [
            'Associate',
            'Professional',
            'Senior Professional',
            'Lead',
            'Principal',
          ];
          return gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade);
        });

      return {
        skillDistribution,
        gradeDistribution,
      };
    } catch (error) {
      this.logger.error('Error calculating distributions:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  private determineSkillStatus(
    averageGap: number,
    userCount: number,
  ): SkillStatus {
    if (averageGap > 2 || userCount < 2) return SkillStatus.CRITICAL;
    if (averageGap > 1 || userCount < 5) return SkillStatus.WARNING;
    return SkillStatus.NORMAL;
  }

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
