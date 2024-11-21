// src/required-skills/services/required-skills.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { RequiredSkillsDto } from '../dto/required-skills.dto';
import {
  EmployeeSkillsResponseDto,
  SkillCategory,
  SkillGapsDto,
  SkillsDto,
  TransformedSkillDto,
  TransformedSkillsResponseDto,
} from '../dto/user-skills.dto';

interface SkillMap {
  [key: string]: number | SkillMap;
}

function transformToReadableKeys<T extends SkillMap>(
  obj: T | null | undefined,
): Record<string, number> {
  if (!obj) return {};

  const transformedObj: Record<string, number> = {};

  for (const [key, value] of Object.entries(obj)) {
    const readableKey = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Handle nested objects by merging their transformed key-value pairs
      const nestedTransformed = transformToReadableKeys(value as SkillMap);
      Object.entries(nestedTransformed).forEach(([nestedKey, nestedValue]) => {
        transformedObj[`${readableKey} ${nestedKey}`] = nestedValue;
      });
    } else {
      // For non-object values, directly assign the number
      transformedObj[readableKey] = value as number;
    }
  }

  return transformedObj;
}

@Injectable()
export class UserSkillsService {
  private readonly logger = new Logger(UserSkillsService.name);
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async getTransformedSkillsData(
    email: string,
  ): Promise<TransformedSkillsResponseDto> {
    const employeeData = await this.getEmployeeSkillsData(email);

    const isTechnicalSkill = (skill: string): boolean => {
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
      return technicalKeywords.some((keyword) => skill.includes(keyword));
    };

    // Safely access the skills objects with nullish coalescing
    const selfSkills = employeeData.assessments?.selfSkills?.skills ?? {};
    const managerSkills = employeeData.assessments?.managerSkills?.skills ?? {};
    const skillAverages = employeeData.staff?.skillAverages ?? {};
    const skillGaps = employeeData.staff?.skillGaps ?? {};

    const transformedSkills: TransformedSkillDto[] = Object.keys(skillAverages)
      .map((skillKey) => {
        const skill = skillKey;
        const currentSkillGap = skillGaps[skill] || 0;
        const averageSkill = skillAverages[skill] || 0;

        // Adjusted computation for required rating based on the gap
        let requiredRating = averageSkill;

        if (currentSkillGap > 0) {
          requiredRating = averageSkill - currentSkillGap; // gap is positive
        } else if (currentSkillGap < 0) {
          requiredRating = averageSkill + currentSkillGap; // gap is negative
        }
        // If gap is 0, requiredRating stays the same as averageSkill

        console.log(
          `Skill: ${skill}, Average: ${averageSkill}, Gap: ${currentSkillGap}, Required Rating: ${requiredRating}`,
        );

        return {
          skill,
          category: isTechnicalSkill(skill)
            ? SkillCategory.TECHNICAL
            : SkillCategory.SOFT,
          selfRating: selfSkills[skill] || 0,
          managerRating: managerSkills[skill] || 0,
          requiredRating,
          gap: currentSkillGap,
          average: averageSkill,
        };
      })
      .sort((a, b) => {
        if (a.category === b.category) {
          return a.skill.localeCompare(b.skill);
        }
        return a.category === SkillCategory.TECHNICAL ? -1 : 1;
      });

    const response: TransformedSkillsResponseDto = {
      skills: transformedSkills,
    };

    return response;
  }

  async getEmployeeSkillsData(
    email: string,
  ): Promise<EmployeeSkillsResponseDto> {
    const [skillGapsData, selfSkills, managerSkills] = await Promise.all([
      this.getComputedSkills(email),
      this.getSelfSkills(email),
      this.getManagerSkills(email),
    ]);

    const transformedAssessments = {
      selfSkills: selfSkills?.skills
        ? transformToReadableKeys(selfSkills.skills)
        : {},
      managerSkills: managerSkills?.skills
        ? transformToReadableKeys(managerSkills.skills)
        : {},
    };

    const response: EmployeeSkillsResponseDto = {
      staff: skillGapsData,
      assessments: {
        selfSkills: { skills: transformedAssessments.selfSkills },
        managerSkills: { skills: transformedAssessments.managerSkills },
      },
    };

    return response;
  }

  private async getComputedSkills(email: string): Promise<SkillGapsDto> {
    const staff = await this.connection
      .collection('Capability_gapAssessments')
      .findOne({ emailAddress: email });

    if (!staff) {
      throw new NotFoundException('Staff data not found');
    }

    const skillGapsData: SkillGapsDto = {
      emailAddress: staff.emailAddress,
      nameOfResource: staff.nameOfResource,
      careerLevel: staff.careerLevel,
      capability: staff.capability,
      skillAverages: transformToReadableKeys(staff.skillAverages || {}),
      skillGaps: transformToReadableKeys(staff.skillGaps || {}),
    };

    return skillGapsData;
  }

  private async getSelfSkills(email: string): Promise<SkillsDto | null> {
    const selfSkills = await this.connection
      .collection('Capability_selfAssessments')
      .findOne<{
        skills: Record<string, number>;
      }>({ emailAddress: email }, { projection: { skills: 1, _id: 0 } });

    return selfSkills ? { skills: selfSkills.skills } : null;
  }

  private async getManagerSkills(email: string): Promise<SkillsDto | null> {
    const managerSkills = await this.connection
      .collection('Capability_managerAssessments')
      .findOne<{
        skills: Record<string, number>;
      }>({ emailOfResource: email }, { projection: { skills: 1, _id: 0 } });

    return managerSkills ? { skills: managerSkills.skills } : null;
  }

  async getRequiredSkillsByBU(prefixBU: string): Promise<RequiredSkillsDto[]> {
    const requiredSkillsData = await this.connection
      .collection('capabilityRequiredSkills')
      .find({ capability: prefixBU })
      .toArray();

    if (!requiredSkillsData || requiredSkillsData.length === 0) {
      throw new NotFoundException(
        'No required skills data found for this business unit.',
      );
    }

    return requiredSkillsData.map((skill) => {
      const requiredSkills =
        skill.requiredSkills instanceof Map
          ? transformToReadableKeys(Object.fromEntries(skill.requiredSkills))
          : transformToReadableKeys(skill.requiredSkills);

      return {
        capability: skill.capability,
        careerLevel: skill.careerLevel,
        requiredSkills,
      };
    });
  }
}
