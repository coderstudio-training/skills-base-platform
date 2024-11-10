// src/required-skills/services/required-skills.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { RequiredSkillsDto } from '../dto/required-skills.dto';

@Injectable()
export class RequiredSkillsService {
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
}
