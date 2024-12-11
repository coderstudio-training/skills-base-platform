// repositories/skills-matrix.repository.ts
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

export interface Assessment {
  emailAddress: string;
  nameOfResource: string;
  careerLevel: string;
  capability: string;
  skillAverages: Record<string, number>;
  skillGaps: Record<string, number>;
}

export interface SelfAssessment {
  emailAddress: string;
  skills: Record<string, number>;
}

export interface ManagerAssessment {
  emailOfResource: string;
  skills: Record<string, number>;
}

export interface RequiredSkills {
  capability: string;
  careerLevel: string;
  requiredSkills: Record<string, number>;
}

export interface SoftSkill {
  title: string;
  category: string;
  description: string;
}

export class SkillsMatrixRepository {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async getAllAssessments(): Promise<Assessment[]> {
    return this.connection
      .collection('Capability_gapAssessments')
      .find({})
      .toArray() as unknown as Promise<Assessment[]>;
  }

  async getAllRequiredSkills(): Promise<RequiredSkills[]> {
    return this.connection
      .collection('capabilityRequiredSkills')
      .find({})
      .toArray() as unknown as Promise<RequiredSkills[]>;
  }

  async getAssessmentByEmail(email: string): Promise<Assessment | null> {
    return this.connection
      .collection('Capability_gapAssessments')
      .findOne({ emailAddress: email }) as Promise<Assessment | null>;
  }

  async getSelfAssessmentByEmail(
    email: string,
  ): Promise<SelfAssessment | null> {
    return this.connection
      .collection('Capability_selfAssessments')
      .findOne({ emailAddress: email }) as Promise<SelfAssessment | null>;
  }

  async getManagerAssessmentByEmail(
    email: string,
  ): Promise<ManagerAssessment | null> {
    return this.connection
      .collection('Capability_managerAssessments')
      .findOne({ emailOfResource: email }) as Promise<ManagerAssessment | null>;
  }

  async getSoftSkills(): Promise<SoftSkill[]> {
    return this.connection
      .collection('soft_skillsInventory')
      .find({})
      .toArray() as unknown as Promise<SoftSkill[]>;
  }

  async getRequiredSkillsByCapabilityAndLevel(
    capability: string,
    careerLevel: string,
  ): Promise<RequiredSkills | null> {
    return this.connection
      .collection('capabilityRequiredSkills')
      .findOne({ capability, careerLevel }) as Promise<RequiredSkills | null>;
  }
}
