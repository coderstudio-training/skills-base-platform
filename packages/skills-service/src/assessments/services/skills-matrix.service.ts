import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { CACHE_MANAGER } from '@skills-base/shared';
import { Cache } from 'cache-manager';
import { Connection } from 'mongoose';
import {
  DistributionSkillStatus,
  DistributionsResponseDto,
  EmployeeRankingsResponseDto,
  OrganizationSkillsAnalysisDto,
} from '../dto/computation.dto';
import {
  CategorySkillsSummaryDto,
  EmployeeSkillsResponseDto,
  SkillCategory,
  SkillDetailsDto,
  SkillsSummaryDto,
  SkillStatus,
  TeamSkillsResponseDto,
} from '../dto/skills-matrix.dto';
import { transformToReadableKeys } from '../utils/skills.util';

const CACHE_KEYS = {
  SOFT_SKILLS: 'skills:soft',
  ADMIN_ANALYSIS: 'analysis:admin',
  DISTRIBUTIONS: 'analysis:distributions',
  RANKINGS: 'analysis:rankings',
  TEAM_SKILLS: (managerName: string) => `team:skills:${managerName}`,
  CAPABILITY_ANALYSIS: (capability: string) =>
    `analysis:capability:${capability}`,
} as const;

const CACHE_TTL = {
  SOFT_SKILLS: 24 * 3600000, // 24 hours for soft skills
  TEAM_SKILLS: 24 * 3600000, // 24 hours for team skills
  ANALYSIS: 3600000, // 1 hour for analysis
  DISTRIBUTIONS: 3600000, // 1 hour for distributions
  RANKINGS: 3600000, // 1 hour for rankings
} as const;

@Injectable()
export class SkillsMatrixService {
  private readonly logger = new Logger(SkillsMatrixService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.initializeSoftSkillsCache();
  }

  private async initializeSoftSkillsCache() {
    try {
      let softSkills = await this.cacheManager.get(CACHE_KEYS.SOFT_SKILLS);

      if (!softSkills) {
        softSkills = await this.connection
          .collection('soft_skillsInventory')
          .find({})
          .toArray();

        await this.cacheManager.set(
          CACHE_KEYS.SOFT_SKILLS,
          softSkills,
          CACHE_TTL.SOFT_SKILLS,
        );
      }
    } catch (error) {
      this.logger.error('Error initializing soft skills cache:', error);
    }
  }

  private async determineSkillCategory(
    skillName: string,
  ): Promise<SkillCategory> {
    try {
      const softSkill = await this.connection
        .collection('soft_skillsInventory')
        .findOne({
          title: new RegExp(skillName, 'i'), // Case insensitive match on title only
        });

      return softSkill ? SkillCategory.SOFT : SkillCategory.TECHNICAL;
    } catch (error) {
      this.logger.error(
        `Error determining skill category for ${skillName}:`,
        error,
      );
      throw error;
    }
  }

  private determineSkillStatus(gap: number): SkillStatus {
    return gap >= 0 ? SkillStatus.PROFICIENT : SkillStatus.DEVELOPING;
  }

  private calculateCategoryMetrics(
    skills: SkillDetailsDto[],
  ): CategorySkillsSummaryDto {
    const gaps = skills.map((skill) => skill.gap);
    const ratings = skills.map((skill) => skill.average);

    return {
      averageGap: this.calculateAverage(gaps),
      skillsMeetingRequired: gaps.filter((gap) => gap >= 0).length,
      skillsNeedingImprovement: gaps.filter((gap) => gap < 0).length,
      largestGap: Math.min(...gaps),
      averageRating: this.calculateAverage(ratings),
      totalSkills: skills.length,
    };
  }

  private calculateSkillsSummary(skills: SkillDetailsDto[]): SkillsSummaryDto {
    const softSkills = skills.filter(
      (skill) => skill.category === SkillCategory.SOFT,
    );
    const technicalSkills = skills.filter(
      (skill) => skill.category === SkillCategory.TECHNICAL,
    );

    return {
      overall: this.calculateCategoryMetrics(skills),
      softSkills: this.calculateCategoryMetrics(softSkills),
      technicalSkills: this.calculateCategoryMetrics(technicalSkills),
    };
  }

  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return Number(
      (numbers.reduce((a, b) => a + b, 0) / numbers.length).toFixed(2),
    );
  }

  private async createSkillDetails(
    skillName: string,
    selfRating: number,
    managerRating: number,
    gap: number,
    requiredRating: number = 0,
  ): Promise<SkillDetailsDto> {
    const skillDetails = new SkillDetailsDto();
    skillDetails.name = skillName;
    skillDetails.category = await this.determineSkillCategory(skillName);
    skillDetails.selfRating = selfRating;
    skillDetails.managerRating = managerRating;
    skillDetails.average = Number(
      ((selfRating + managerRating) / 2).toFixed(2),
    );
    skillDetails.gap = gap;
    skillDetails.required = requiredRating;
    skillDetails.status = this.determineSkillStatus(gap);
    return skillDetails;
  }

  async getEmployeeSkillsSummary(email: string): Promise<SkillsSummaryDto> {
    this.logger.log(`Fetching skills summary for email: ${email}`);

    try {
      const employeeSkills = await this.getEmployeeSkillsByEmail(email);

      if (!employeeSkills || !employeeSkills.skills) {
        throw new NotFoundException(`No skills found for email: ${email}`);
      }

      return this.calculateSkillsSummary(employeeSkills.skills);
    } catch (error) {
      this.logger.error(
        `Error calculating skills summary for ${email}:`,
        error,
      );
      throw error;
    }
  }

  async getEmployeeSkillsByEmail(
    email: string,
  ): Promise<EmployeeSkillsResponseDto> {
    try {
      const [gapAssessment, selfAssessment, managerAssessment] =
        await Promise.all([
          this.connection
            .collection('Capability_gapAssessments')
            .findOne({ emailAddress: email }),
          this.connection
            .collection('Capability_selfAssessments')
            .findOne({ emailAddress: email }),
          this.connection
            .collection('Capability_managerAssessments')
            .findOne({ emailOfResource: email }),
        ]);

      if (!gapAssessment) {
        throw new NotFoundException(`No assessment found for email: ${email}`);
      }

      // Get skills from original data without transformation for values
      const skillNames = new Set([
        ...Object.keys(gapAssessment.skillAverages || {}),
        ...Object.keys(gapAssessment.skillGaps || {}),
        ...Object.keys(selfAssessment?.skills || {}),
        ...Object.keys(managerAssessment?.skills || {}),
      ]);

      // Fetch required skills
      const requiredSkills = await this.connection
        .collection('capabilityRequiredSkills')
        .findOne({
          capability: gapAssessment.capability,
          careerLevel: gapAssessment.careerLevel,
        });

      if (requiredSkills?.requiredSkills) {
        Object.keys(requiredSkills.requiredSkills).forEach((key) =>
          skillNames.add(key),
        );
      }

      // Create skills array with transformed names but original values
      const skills = await Promise.all(
        Array.from(skillNames).map(async (originalSkillName) => {
          const transformedName = transformToReadableKeys({
            [originalSkillName]: 0,
          });
          const readableName = Object.keys(transformedName)[0];

          return this.createSkillDetails(
            readableName,
            selfAssessment?.skills?.[originalSkillName] ?? 0,
            managerAssessment?.skills?.[originalSkillName] ?? 0,
            gapAssessment.skillGaps?.[originalSkillName] ?? 0,
            requiredSkills?.requiredSkills?.[originalSkillName] ?? 0,
          );
        }),
      );

      const response = new EmployeeSkillsResponseDto();
      response.email = gapAssessment.emailAddress;
      response.name = gapAssessment.nameOfResource;
      response.careerLevel = gapAssessment.careerLevel;
      response.capability = gapAssessment.capability;
      response.skills = skills.sort((a, b) => a.name.localeCompare(b.name));

      return response;
    } catch (error) {
      this.logger.error(`Error fetching skills for email ${email}:`, error);
      throw error;
    }
  }

  async getAdminSkillsAnalysis(): Promise<OrganizationSkillsAnalysisDto> {
    try {
      // Try to get from cache first
      const cachedAnalysis = await this.cacheManager.get(
        CACHE_KEYS.ADMIN_ANALYSIS,
      );
      if (cachedAnalysis) {
        this.logger.log('Returning admin skills analysis from cache');
        return cachedAnalysis as OrganizationSkillsAnalysisDto;
      }

      const result = await this.computeAdminSkillsAnalysis();

      // Cache the result
      await this.cacheManager.set(
        CACHE_KEYS.ADMIN_ANALYSIS,
        result,
        CACHE_TTL.ANALYSIS,
      ); // 1 hour cache

      return result;
    } catch (error) {
      this.logger.error(
        'Error calculating organization technical skills analysis:',
        error,
      );
      throw error;
    }
  }

  private async computeAdminSkillsAnalysis(): Promise<OrganizationSkillsAnalysisDto> {
    try {
      const [allAssessments, allRequiredSkills] = await Promise.all([
        this.connection
          .collection('Capability_gapAssessments')
          .find({})
          .toArray(),
        this.connection
          .collection('capabilityRequiredSkills')
          .find({})
          .toArray(),
      ]);

      // Group assessments by capability
      const assessmentsByCapability = new Map();
      const requiredSkillsByCapability = new Map();

      allAssessments.forEach((assessment) => {
        const capability = assessment.capability;
        if (!assessmentsByCapability.has(capability)) {
          assessmentsByCapability.set(capability, []);
        }
        assessmentsByCapability.get(capability).push(assessment);
      });

      allRequiredSkills.forEach((required) => {
        requiredSkillsByCapability.set(required.capability, required);
      });

      // Get soft skills from cache
      const softSkills = (await this.cacheManager.get(
        CACHE_KEYS.SOFT_SKILLS,
      )) as any[];
      const softSkillTitles = new Set(
        softSkills?.map((skill) => skill.title.toLowerCase()),
      );

      const capabilityAnalyses = Array.from(
        assessmentsByCapability.entries(),
      ).map(([capability, assessments]) => {
        const skillsMap = new Map();
        const requiredSkills =
          requiredSkillsByCapability.get(capability)?.requiredSkills || {};

        assessments.forEach(
          (assessment: {
            skillAverages: any;
            skillGaps: { [x: string]: number };
          }) => {
            Object.entries(assessment.skillAverages || {}).forEach(
              ([skillName, average]) => {
                const transformedName = Object.keys(
                  transformToReadableKeys({ [skillName]: 0 }),
                )[0];

                // Skip if soft skill using cached soft skills
                if (softSkillTitles.has(transformedName.toLowerCase())) return;

                const gap = assessment.skillGaps?.[skillName] ?? 0;
                const required = requiredSkills[skillName] ?? 0;

                const existing = skillsMap.get(transformedName) || {
                  totalAverage: 0,
                  count: 0,
                  required,
                  gap: 0,
                };

                existing.totalAverage += average as number;
                existing.gap += gap as number;
                existing.count += 1;
                skillsMap.set(transformedName, existing);
              },
            );
          },
        );

        // Calculate metrics for each skill
        const skills = Array.from(skillsMap.entries()).map(([name, data]) => ({
          name,
          prevalence: Number(
            ((data.totalAverage / (data.count * 5)) * 100).toFixed(2),
          ),
          currentAvg: Number((data.totalAverage / data.count).toFixed(2)),
          requiredLevel: data.required,
          gap: Number((data.gap / data.count).toFixed(2)),
        }));

        return {
          capability,
          // topSkills: skills
          //   .sort((a, b) => b.prevalence - a.prevalence)
          //   .slice(0, 5)
          //   .map(({ name, prevalence }) => ({ name, prevalence })),
          skillGaps: skills
            .sort((a, b) => a.gap - b.gap)
            .slice(0, 5)
            .map(({ name, currentAvg, requiredLevel, gap }) => ({
              name,
              currentAvg,
              requiredLevel,
              gap,
            })),
        };
      });

      return {
        capabilities: capabilityAnalyses.filter(
          (analysis) =>
            // analysis.topSkills.length >= 2 &&
            analysis.skillGaps.length >= 2,
        ),
      };
    } catch (error) {
      this.logger.error(
        'Error computing organization technical skills analysis:',
        error,
      );
      throw error;
    }
  }

  async getDistributions(): Promise<DistributionsResponseDto> {
    try {
      // Try to get from cache first
      const cachedDistributions = await this.cacheManager.get(
        CACHE_KEYS.DISTRIBUTIONS,
      );
      if (cachedDistributions) {
        this.logger.log('Returning distributions from cache');
        return cachedDistributions as DistributionsResponseDto;
      }

      // Get all assessments at once
      const allAssessments = await this.connection
        .collection('Capability_gapAssessments')
        .find()
        .toArray();

      // Maps for tracking distributions
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

      // Get soft skills from cache
      const softSkills = (await this.cacheManager.get(
        CACHE_KEYS.SOFT_SKILLS,
      )) as any[];
      const softSkillTitles = new Set(
        softSkills?.map((skill) => skill.title.toLowerCase()),
      );

      // Process each assessment
      for (const assessment of allAssessments) {
        // Track grade distribution
        const grade = assessment.careerLevel;
        gradeMap.set(grade, (gradeMap.get(grade) || 0) + 1);

        const businessUnit = assessment.capability;
        if (!businessUnitMap.has(businessUnit)) {
          businessUnitMap.set(businessUnit, new Map());
        }
        const categoryMap = businessUnitMap.get(businessUnit)!;

        // Process skills
        Object.entries(assessment.skillAverages || {}).forEach(
          ([skillName]) => {
            const transformedName = Object.keys(
              transformToReadableKeys({ [skillName]: 0 }),
            )[0];

            // Determine category using cached soft skills
            const category = softSkillTitles.has(transformedName.toLowerCase())
              ? SkillCategory.SOFT
              : SkillCategory.TECHNICAL;

            // Track skills by category within business unit
            if (!categoryMap.has(category)) {
              categoryMap.set(category, new Set());
            }
            categoryMap.get(category)?.add(transformedName);

            // Track users and gaps per skill
            const skillKey = `${businessUnit}:${transformedName}`;
            if (!skillUserMap.has(skillKey)) {
              skillUserMap.set(skillKey, {
                users: new Set(),
                totalGap: 0,
                category,
                businessUnit,
              });
            }

            const skillData = skillUserMap.get(skillKey)!;
            skillData.users.add(assessment.emailAddress);

            const gap = assessment.skillGaps?.[skillName] ?? 0;
            if (gap < 0) {
              skillData.totalGap += Math.abs(gap);
            }
          },
        );
      }

      // Transform data for response
      const skillDistribution = Array.from(businessUnitMap.entries())
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
                    status: this.determineDistributionStatus(
                      averageGap,
                      skillData.users.size,
                    ),
                  };
                })
                .sort((a, b) => b.userCount - a.userCount),
            }))
            .sort((a, b) => a.category.localeCompare(b.category)),
        }))
        .sort((a, b) => a.businessUnit.localeCompare(b.businessUnit));

      const gradeDistribution = Array.from(gradeMap.entries())
        .map(([grade, userCount]) => ({
          grade,
          userCount,
        }))
        .sort((a, b) => {
          const gradeOrder = [
            'Associate',
            'Professional',
            'Senior Professional',
            'Lead',
            'Principal',
          ];
          return gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade);
        });

      const distributions = {
        skillDistribution,
        gradeDistribution,
      };

      // Cache the result
      await this.cacheManager.set(
        CACHE_KEYS.DISTRIBUTIONS,
        distributions,
        CACHE_TTL.ANALYSIS,
      );

      return distributions;
    } catch (error) {
      this.logger.error('Error calculating distributions:', error);
      throw error;
    }
  }

  private determineDistributionStatus(
    averageGap: number,
    userCount: number,
  ): DistributionSkillStatus {
    if (averageGap > 2 || userCount < 2)
      return DistributionSkillStatus.CRITICAL;
    if (averageGap > 1 || userCount < 5) return DistributionSkillStatus.WARNING;
    return DistributionSkillStatus.NORMAL;
  }

  async getEmployeeRankings(): Promise<EmployeeRankingsResponseDto> {
    try {
      // Try to get from cache first
      const cachedRankings = await this.cacheManager.get(CACHE_KEYS.RANKINGS);
      if (cachedRankings) {
        this.logger.log('Returning rankings from cache');
        return cachedRankings as EmployeeRankingsResponseDto;
      }

      const assessments = await this.connection
        .collection('Capability_gapAssessments')
        .find()
        .toArray();

      // Calculate scores and sort employees
      const sortedEmployees = assessments
        .map((assessment) => {
          const validSkills = Object.values(assessment.skillAverages || {})
            .map((avg) => Number(avg))
            .filter((avg) => avg > 0);

          const averageScore =
            validSkills.length > 0
              ? Number(
                  (
                    validSkills.reduce((sum, val) => sum + val, 0) /
                    validSkills.length
                  ).toFixed(1),
                )
              : 0;
          return {
            name: assessment.nameOfResource,
            score: averageScore,
            skillCount: validSkills.length,
          };
        })
        .sort((a, b) => {
          const scoreDiff = b.score - a.score;
          if (scoreDiff !== 0) return scoreDiff;
          const skillCountDiff = b.skillCount - a.skillCount;
          if (skillCountDiff !== 0) return skillCountDiff;
          return a.name.localeCompare(b.name);
        });

      // Take top 10 and assign rankings
      const rankings = {
        rankings: sortedEmployees.slice(0, 10).map((employee, index) => ({
          name: employee.name,
          ranking: index + 1,
          score: employee.score,
        })),
      };

      // Cache the result
      await this.cacheManager.set(
        CACHE_KEYS.RANKINGS,
        rankings,
        CACHE_TTL.ANALYSIS,
      );

      return rankings;
    } catch (error) {
      this.logger.error('Error calculating employee rankings:', error);
      throw error;
    }
  }

  async getTeamSkills(managerName: string): Promise<TeamSkillsResponseDto> {
    try {
      // Try to get from cache first
      const cachedTeamSkills = await this.cacheManager.get(
        CACHE_KEYS.TEAM_SKILLS(managerName),
      );

      if (cachedTeamSkills) {
        this.logger.log('Returning team skills from cache');
        return cachedTeamSkills as TeamSkillsResponseDto;
      }

      // If not in cache, fetch from database
      const teamAssessments = await this.connection
        .collection('Capability_managerAssessments')
        .find({ nameOfRespondent: managerName })
        .toArray();

      if (!teamAssessments || teamAssessments.length === 0) {
        return { members: [] };
      }

      const teamSkills = await Promise.all(
        teamAssessments.map(async (memberAssessment) => {
          const gapAssessment = await this.connection
            .collection('Capability_gapAssessments')
            .findOne({ emailAddress: memberAssessment.emailOfResource });

          const skills = gapAssessment
            ? await this.getEmployeeSkillsByEmail(
                memberAssessment.emailOfResource,
              )
            : null;

          return {
            email: memberAssessment.emailOfResource,
            name: memberAssessment.nameOfResource,
            careerLevel: memberAssessment.careerLevelOfResource,
            capability: memberAssessment.capability,
            skills: skills?.skills || [],
          };
        }),
      );

      const result = { members: teamSkills };

      // Cache the results
      await this.cacheManager.set(
        CACHE_KEYS.TEAM_SKILLS(managerName),
        result,
        CACHE_TTL.ANALYSIS,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Error fetching team skills for manager ${managerName}:`,
        error,
      );
      throw error;
    }
  }
}
