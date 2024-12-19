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
          .find()
          .toArray(),
        this.connection.collection('capabilityRequiredSkills').find().toArray(),
      ]);

      // Get soft skills from cache first
      const softSkills = (await this.cacheManager.get(
        CACHE_KEYS.SOFT_SKILLS,
      )) as any[];
      const softSkillTitles = new Set(
        softSkills?.map((skill) => skill.title.toLowerCase()) || [],
      );

      // Track career level distribution
      const careerLevelCounts = new Map<string, number>();

      // Track skills data by capability
      const assessmentsByCapability = new Map<
        string,
        {
          assessments: any[];
          skillsMap: Map<
            string,
            {
              totalAverage: number;
              count: number;
              byCareerLevel: Map<
                string,
                {
                  totalAverage: number;
                  count: number;
                  requiredLevel: number;
                }
              >;
            }
          >;
        }
      >();

      // Initialize capability groups and count career levels
      allAssessments.forEach((assessment) => {
        const capability = assessment.capability;
        const careerLevel = assessment.careerLevel;

        // Track career level counts
        careerLevelCounts.set(
          careerLevel,
          (careerLevelCounts.get(careerLevel) || 0) + 1,
        );

        if (!assessmentsByCapability.has(capability)) {
          assessmentsByCapability.set(capability, {
            assessments: [],
            skillsMap: new Map(),
          });
        }
        assessmentsByCapability.get(capability)!.assessments.push(assessment);
      });

      // Process assessments by capability
      assessmentsByCapability.forEach((capabilityData) => {
        const { assessments, skillsMap } = capabilityData;

        assessments.forEach((assessment) => {
          const careerLevel = assessment.careerLevel;

          Object.entries(assessment.skillAverages || {}).forEach(
            ([skillName, average]) => {
              const transformedName = Object.keys(
                transformToReadableKeys({ [skillName]: 0 }),
              )[0];

              // Skip if soft skill
              if (softSkillTitles.has(transformedName.toLowerCase())) return;

              const numericAverage = Number(average);

              if (!skillsMap.has(transformedName)) {
                skillsMap.set(transformedName, {
                  totalAverage: 0,
                  count: 0,
                  byCareerLevel: new Map(),
                });
              }

              const skillData = skillsMap.get(transformedName)!;

              // Update overall metrics
              skillData.totalAverage += numericAverage;
              skillData.count += 1;

              // Update career level specific metrics
              if (!skillData.byCareerLevel.has(careerLevel)) {
                skillData.byCareerLevel.set(careerLevel, {
                  totalAverage: 0,
                  count: 0,
                  requiredLevel: 0,
                });
              }
              const careerLevelData = skillData.byCareerLevel.get(careerLevel)!;
              careerLevelData.totalAverage += numericAverage;
              careerLevelData.count += 1;
            },
          );
        });
      });

      // Calculate weighted required levels and process final metrics
      const capabilityAnalyses = Array.from(
        assessmentsByCapability.entries(),
      ).map(([capability, data]) => {
        const skillGaps = Array.from(data.skillsMap.entries()).map(
          ([skillName, skillData]) => {
            // Calculate overall average for this skill
            const currentAvg = Number(
              (skillData.totalAverage / skillData.count).toFixed(2),
            );

            // Calculate weighted required level based on career level distribution
            let weightedRequiredLevel = 0;
            let totalWeight = 0;

            // Process each career level
            skillData.byCareerLevel.forEach((levelData, careerLevel) => {
              const levelCount = careerLevelCounts.get(careerLevel) || 0;

              // Find required skills doc for this capability and career level
              const requiredSkillsDoc = allRequiredSkills.find(
                (req) =>
                  req.capability === capability &&
                  req.careerLevel === careerLevel,
              );

              // Find matching skill in required skills
              let requiredLevel = 0;
              if (requiredSkillsDoc?.requiredSkills) {
                for (const [origSkillName, level] of Object.entries(
                  requiredSkillsDoc.requiredSkills,
                )) {
                  const transformedOrigName = Object.keys(
                    transformToReadableKeys({ [origSkillName]: 0 }),
                  )[0];

                  if (transformedOrigName === skillName) {
                    requiredLevel = Number(level) || 0;
                    break;
                  }
                }
              }

              weightedRequiredLevel += requiredLevel * levelCount;
              totalWeight += levelCount;
            });

            // Calculate final required level
            const effectiveRequiredLevel =
              totalWeight > 0
                ? Number((weightedRequiredLevel / totalWeight).toFixed(2))
                : 4;

            // Calculate gap (positive means above requirements)
            const gap = Number(
              (currentAvg - effectiveRequiredLevel).toFixed(2),
            );

            return {
              name: skillName,
              currentAvg,
              requiredLevel: effectiveRequiredLevel,
              gap,
              careerLevelBreakdown: Array.from(
                skillData.byCareerLevel.entries(),
              )
                .map(([level, levelData]) => ({
                  careerLevel: level,
                  average: Number(
                    (levelData.totalAverage / levelData.count).toFixed(2),
                  ),
                  employeeCount: levelData.count,
                }))
                .sort((a, b) => b.employeeCount - a.employeeCount),
            };
          },
        );
        // .sort((a, b) => b.gap - a.gap)
        // .slice(0, 5);

        return {
          capability,
          skillGaps,
        };
      });

      return {
        capabilities: capabilityAnalyses
          .filter((analysis) => analysis.skillGaps.length >= 2)
          .map((analysis) => ({
            capability: analysis.capability,
            skillGaps: analysis.skillGaps.map((gap) => ({
              name: gap.name,
              currentAvg: gap.currentAvg,
              requiredLevel: gap.requiredLevel,
              gap: gap.gap,
            })),
          })),
      };
    } catch (error) {
      this.logger.error('Error computing organization skills analysis:', error);
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
      const skillMap = new Map<
        string,
        {
          totalLevel: number;
          userCount: number;
          users: Map<string, number>; // email -> skill level
          businessUnit: string;
          totalGap: number;
        }
      >();
      const gradeMap = new Map<string, number>();

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

        // Initialize technical skills category
        if (!categoryMap.has(SkillCategory.TECHNICAL)) {
          categoryMap.set(SkillCategory.TECHNICAL, new Set());
        }

        // Process skills
        Object.entries(assessment.skillAverages || {}).forEach(
          ([skillName, level]) => {
            const transformedName = Object.keys(
              transformToReadableKeys({ [skillName]: 0 }),
            )[0];

            // Track skills within business unit
            categoryMap.get(SkillCategory.TECHNICAL)?.add(transformedName);

            // Track skill levels and users
            const skillKey = `${businessUnit}:${transformedName}`;
            if (!skillMap.has(skillKey)) {
              skillMap.set(skillKey, {
                totalLevel: 0,
                userCount: 0,
                users: new Map(),
                businessUnit,
                totalGap: 0,
              });
            }

            const skillData = skillMap.get(skillKey)!;
            skillData.totalLevel += Number(level);
            skillData.userCount += 1;
            skillData.users.set(assessment.emailAddress, Number(level));

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
                  const skillData = skillMap.get(skillKey)!;

                  // Calculate average level for this skill
                  const averageLevel =
                    skillData.totalLevel / skillData.userCount;

                  // Count users below average
                  const usersBelowAverage = Array.from(
                    skillData.users.entries(),
                  ).filter(([, level]) => level < averageLevel).length;

                  // Skip if no users are below average
                  if (usersBelowAverage === 0) {
                    return null;
                  }

                  const averageGap = skillData.totalGap / skillData.userCount;

                  return {
                    name: skillName,
                    userCount: usersBelowAverage,
                    status: this.determineDistributionStatus(
                      averageGap,
                      usersBelowAverage,
                      skillData.userCount,
                    ),
                  };
                })
                .filter(
                  (skill): skill is NonNullable<typeof skill> => skill !== null,
                )
                .sort((a, b) => b.userCount - a.userCount),
            }))
            .filter((category) => category.skills.length > 0)
            .sort((a, b) => a.category.localeCompare(b.category)),
        }))
        .filter((bu) => bu.categories.length > 0)
        .sort((a, b) => a.businessUnit.localeCompare(b.businessUnit));

      const gradeDistribution = Array.from(gradeMap.entries())
        .map(([grade, userCount]) => ({
          grade,
          userCount,
        }))
        .sort((a, b) => {
          const gradeOrder = ['Professional', 'Manager', 'Director'];
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
    belowAverageCount: number,
    totalUsers: number,
  ): DistributionSkillStatus {
    // Calculate what percentage of users are below average
    const percentageBelowAverage = (belowAverageCount / totalUsers) * 100;

    // If more than 50% are below average or there's a significant gap
    if (percentageBelowAverage > 50 || averageGap < -2) {
      return DistributionSkillStatus.CRITICAL;
    }
    // If more than 25% are below average or there's a moderate gap
    if (percentageBelowAverage > 25 || averageGap < -1) {
      return DistributionSkillStatus.WARNING;
    }
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
