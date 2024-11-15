// src/required-skills/services/required-skills.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { RequiredSkillsDto } from '../dto/required-skills.dto';
import { SkillGapsDto } from '../dto/skill-gaps.dto';

// Helper function to format camel case to readable text
function formatSkillName(skill: string): string {
  return skill
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
}

@Injectable()
export class RequiredSkillsService {
  private readonly logger = new Logger(RequiredSkillsService.name);
  constructor(@InjectConnection() private readonly connection: Connection) {}

  // Fetch required skills by business unit prefix (capability)
  async getRequiredSkillsByBU(prefixBU: string): Promise<RequiredSkillsDto[]> {
    const requiredSkillsData = await this.connection
      .collection('capabilityRequiredSkills') // Use the collection name directly
      .find({ capability: prefixBU })
      .toArray(); // Convert the result into an array of documents

    if (!requiredSkillsData || requiredSkillsData.length === 0) {
      throw new NotFoundException(
        'No required skills data found for this business unit.',
      );
    }

    return requiredSkillsData.map((skill) => {
      const requiredSkills =
        skill.requiredSkills instanceof Map
          ? Object.fromEntries(skill.requiredSkills)
          : skill.requiredSkills;

      return {
        capability: skill.capability,
        careerLevel: skill.careerLevel,
        requiredSkills,
      };
    });
  }

  async getEmployeeSkillGaps(email: string): Promise<SkillGapsDto> {
    this.logger.log(`Fetching skill gaps for employee with email: ${email}`);

    const employeeData = await this.connection
      .collection('Capability_gapAssessments')
      .findOne({ emailAddress: email });

    if (!employeeData) {
      this.logger.error(
        `Skill gaps not found for employee with email: ${email}`,
      );
      throw new NotFoundException(
        'Skill gaps data not found for this employee.',
      );
    }

    this.logger.log(`Successfully retrieved skill gaps data for ${email}`);

    // Transform skill names for display purposes, explicitly casting values to number
    const formattedSkillAverages: Record<string, number> = Object.fromEntries(
      Object.entries(employeeData.skillAverages).map(([key, value]) => [
        formatSkillName(key),
        value as number,
      ]),
    );
    const formattedSkillGaps: Record<string, number> = Object.fromEntries(
      Object.entries(employeeData.skillGaps).map(([key, value]) => [
        formatSkillName(key),
        value as number,
      ]),
    );

    // Convert the employeeData to SkillGapsDto with formatted skill names
    const skillGapsData: SkillGapsDto = {
      emailAddress: employeeData.emailAddress,
      nameOfResource: employeeData.nameOfResource,
      careerLevel: employeeData.careerLevel,
      capability: employeeData.capability,
      skillAverages: formattedSkillAverages,
      skillGaps: formattedSkillGaps,
    };

    return skillGapsData;
  }

  async getEmployeeSkillsData(email: string) {
    // Get Current Employee Skill Levels and Gap
    const user = await this.connection
      .collection('Capability_gapAssessments')
      .findOne({ emailAddress: email });
    if (!user) throw new NotFoundException('User data not found');

    const formattedSkillAverages: Record<string, number> = Object.fromEntries(
      Object.entries(user.skillAverages).map(([key, value]) => [
        formatSkillName(key),
        value as number,
      ]),
    );
    const formattedSkillGaps: Record<string, number> = Object.fromEntries(
      Object.entries(user.skillGaps).map(([key, value]) => [
        formatSkillName(key),
        value as number,
      ]),
    );

    // Transform user data to match SkillGapsDto structure
    const skillGapsData: SkillGapsDto = {
      emailAddress: user.emailAddress,
      nameOfResource: user.nameOfResource,
      careerLevel: user.careerLevel,
      capability: user.capability,
      skillAverages: formattedSkillAverages, // Assuming `skillAverages` is already in the correct format
      skillGaps: formattedSkillGaps, // Assuming `skillGaps` is already in the correct format
    };

    // Get Assessment Data from Self
    const selfSkills = await this.connection
      .collection('Capability_selfAssessments')
      .findOne({ emailAddress: email }, { projection: { skills: 1 } });

    // Get Assessment Data from Manager
    const managerSkills = await this.connection
      .collection('Capability_managerAssessments')
      .findOne({ emailOfResource: email }, { projection: { skills: 1 } });

    // Return the data in the expected structure
    return {
      user: skillGapsData, // This matches the expected SkillGapsDto structure
      assessments: {
        selfSkills: selfSkills ? selfSkills.skills : {},
        managerSkills: managerSkills ? managerSkills.skills : {},
      },
    };
  }
}
