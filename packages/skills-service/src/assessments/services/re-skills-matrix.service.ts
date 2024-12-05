import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import {
  EmployeeSkillsResponseDto,
  SkillCategory,
  SkillDetailsDto,
  SkillsSummaryDto,
} from '../dto/re-skills-matrix.dto';
import { transformToReadableKeys } from '../utils/skills.util';

@Injectable()
export class SkillsMatrixService {
  private readonly logger = new Logger(SkillsMatrixService.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  private determineSkillCategory(skillName: string): SkillCategory {
    const technicalKeywords = [
      'software',
      'test',
      'quality',
      'agile',
      'technology',
      'project',
      'business',
      'engineering',
      'standards',
      'process',
    ];

    // Convert the transformed name back to lowercase for comparison
    const lowercaseSkillName = skillName.toLowerCase();
    return technicalKeywords.some((keyword) =>
      lowercaseSkillName.includes(keyword.toLowerCase()),
    )
      ? SkillCategory.TECHNICAL
      : SkillCategory.SOFT;
  }

  private calculateSkillsSummary(skills: SkillDetailsDto[]): SkillsSummaryDto {
    const gaps = skills.map((skill) => skill.gap);
    const softSkills = skills.filter(
      (skill) => skill.category === SkillCategory.SOFT,
    );
    const technicalSkills = skills.filter(
      (skill) => skill.category === SkillCategory.TECHNICAL,
    );

    const summary = new SkillsSummaryDto();
    summary.averageGap = this.calculateAverage(gaps);
    summary.skillsMeetingRequired = gaps.filter((gap) => gap >= 0).length;
    summary.skillsNeedingImprovement = gaps.filter((gap) => gap < 0).length;
    summary.largestGap = Math.min(...gaps);
    summary.softSkillsAverage = this.calculateAverage(
      softSkills.map((skill) => skill.average),
    );
    summary.technicalSkillsAverage = this.calculateAverage(
      technicalSkills.map((skill) => skill.average),
    );
    summary.totalSkillsAssessed = skills.length;

    return summary;
  }

  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return Number(
      (numbers.reduce((a, b) => a + b, 0) / numbers.length).toFixed(2),
    );
  }

  private createSkillDetails(
    skillName: string,
    selfRating: number,
    managerRating: number,
    gap: number,
    requiredRating: number = 0,
  ): SkillDetailsDto {
    const skillDetails = new SkillDetailsDto();
    skillDetails.name = skillName;
    skillDetails.category = this.determineSkillCategory(skillName);
    skillDetails.selfRating = selfRating;
    skillDetails.managerRating = managerRating;
    skillDetails.average = Number(
      ((selfRating + managerRating) / 2).toFixed(2),
    );
    skillDetails.gap = gap;
    skillDetails.required = requiredRating;
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
      const skills = Array.from(skillNames).map((originalSkillName) => {
        const transformedName = transformToReadableKeys({
          [originalSkillName]: 0,
        });
        const readableName = Object.keys(transformedName)[0];

        return this.createSkillDetails(
          readableName, // Use transformed name
          selfAssessment?.skills?.[originalSkillName] ?? 0,
          managerAssessment?.skills?.[originalSkillName] ?? 0,
          gapAssessment.skillGaps?.[originalSkillName] ?? 0,
          requiredSkills?.requiredSkills?.[originalSkillName] ?? 0,
        );
      });

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
}
