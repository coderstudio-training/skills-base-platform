// assessments.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BulkWriteResult } from 'mongodb';
import { Model } from 'mongoose';
import { BaseSkillsDto, BulkUpdateSkillsDto } from './dto/assessments.dto';
import { ManagerSkills, SelfSkills } from './entities/assessments.entity';

@Injectable()
export class SkillsService {
  private readonly logger = new Logger(SkillsService.name);
  private readonly BATCH_SIZE = 1000;

  constructor(
    @InjectModel(SelfSkills.name) private selfSkillsModel: Model<SelfSkills>,
    @InjectModel(ManagerSkills.name) private managerSkillsModel: Model<ManagerSkills>,
  ) {
    this.ensureIndexes();
  }

  private async ensureIndexes(): Promise<void> {
    await this.selfSkillsModel.collection.createIndex({ email: 1 }, { unique: true, background: true });
    await this.managerSkillsModel.collection.createIndex({ emailOfResource: 1 }, { unique: true, background: true });
  }

  async bulkUpsert(assessmentType: string, bulkUpdateDto: BulkUpdateSkillsDto): Promise<{ updatedCount: number; errors: any[] }> {
    const model = this.getModelForAssessmentType(assessmentType);
    let totalUpdatedCount = 0;
    const errors = [];

    for (let i = 0; i < bulkUpdateDto.data.length; i += this.BATCH_SIZE) {
      const batch = bulkUpdateDto.data.slice(i, i + this.BATCH_SIZE);
      try {
        const result = await this.processBatch(model, batch, assessmentType);
        totalUpdatedCount += result.modifiedCount + result.upsertedCount;
      } catch (error: unknown) {
        this.logger.error('Error processing batch', error);
        errors.push({ error });
      }
    }

    return { updatedCount: totalUpdatedCount, errors };
  }

  private getModelForAssessmentType(assessmentType: string): Model<any> {
    return assessmentType === 'manager' ? this.managerSkillsModel : this.selfSkillsModel;
  }

  private async processBatch(model: Model<any>, batch: BaseSkillsDto[], assessmentType: string): Promise<BulkWriteResult> {
    const operations = batch.map((item) => {
      const filter = assessmentType === 'manager'
        ? { emailOfResource: item.emailOfResource } // Use emailOfResource for manager assessments
        : { email: item.email }; // Use email for self assessments

      return {
        updateOne: {
          filter,
          update: {
            $set: {
              timestamp: new Date(item.timestamp),
              resourceName: item.resourceName,
              capability: item.capability,
              careerLevel: item.careerLevel,
              nameOfRespondent: item.nameOfRespondent,
              emailOfResource: item.emailOfResource, // Include emailOfResource if present
              skills: item.skills,
              lastUpdated: new Date(),
            },
          },
          upsert: true,
        },
      };
    });

    return model.bulkWrite(operations, { ordered: false });
  }
}
