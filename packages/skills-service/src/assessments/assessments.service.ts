// assessments.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BulkWriteResult } from 'mongodb';
import { Model } from 'mongoose';
import { BaseSkillsDto, BulkUpdateSkillsDto } from './dto/assessments.dto';
import { ManagerSkills, SelfSkills } from './entities/assessments.entity';
import { RequiredSkills } from './entities/required-skills.entity';
import { BulkUpdateRequiredSkillsDto, RequiredSkillsDto } from './dto/required-skills.dto';

@Injectable()
export class SkillsService {
  private readonly logger = new Logger(SkillsService.name);
  private readonly BATCH_SIZE = 1000;

  constructor(
    @InjectModel(SelfSkills.name) private selfSkillsModel: Model<SelfSkills>,
    @InjectModel(ManagerSkills.name) private managerSkillsModel: Model<ManagerSkills>,
    @InjectModel(RequiredSkills.name) private readonly requiredSkillsModel: Model<RequiredSkills>,
  ) {
    this.ensureIndexes();
  }

  private async ensureIndexes(): Promise<void> {
    await this.selfSkillsModel.collection.createIndex({ email: 1 }, { unique: true, background: true });
    await this.managerSkillsModel.collection.createIndex({ emailOfResource: 1 }, { unique: true, background: true });
    await this.requiredSkillsModel.collection.createIndex({ careerLevel: 1 }, { unique: true, background: true });
  }

  async bulkUpsert(assessmentType: string, bulkUpdateDto: BulkUpdateSkillsDto | BulkUpdateRequiredSkillsDto): Promise<{ updatedCount: number; errors: any[] }> {
    const model = this.getModelForAssessmentType(assessmentType);
    let totalUpdatedCount = 0;
    const errors = [];

    // Validate the incoming data
    if (!bulkUpdateDto || !bulkUpdateDto.data || !Array.isArray(bulkUpdateDto.data)) {
      this.logger.error('Invalid bulk update data provided');
      throw new BadRequestException('Invalid data format for bulk update');
    }

    if (model === null) {
      const errorMessage = `Error: ${assessmentType} is not a valid assessment type`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage); // Throw an error if the model is null
    }

    this.logger.log(`Starting bulk update for ${assessmentType} with ${bulkUpdateDto.data.length} records`);

    for (let i = 0; i < bulkUpdateDto.data.length; i += this.BATCH_SIZE) {
      const batch = bulkUpdateDto.data.slice(i, i + this.BATCH_SIZE);
      try {
        this.logger.log(`Processing batch ${i / this.BATCH_SIZE + 1}: ${JSON.stringify(batch)}`);
        const result = await this.processBatch(model, batch, assessmentType);
        this.logger.log(`Result of batch processing: ${JSON.stringify(result)}`);
        totalUpdatedCount += result.modifiedCount + result.upsertedCount;
      } catch (error: unknown) {
        this.logger.error('Error processing batch', error);
        errors.push({ error });
      }
    }

    this.logger.log(`Bulk update completed. Total records updated: ${totalUpdatedCount}`);
    return { updatedCount: totalUpdatedCount, errors };
  }

  private getModelForAssessmentType(assessmentType: string): Model<any> | null {
    if (assessmentType === 'manager') {
      return this.managerSkillsModel;
    } else if (assessmentType === 'self') {
      return this.selfSkillsModel;
    } else if (assessmentType === 'required') {
      return this.requiredSkillsModel;
    } else {
      return null;
    }
  }

  private async processBatch(model: Model<any>, batch: (BaseSkillsDto | RequiredSkillsDto)[], assessmentType: string): Promise<BulkWriteResult> {
    const operations = batch.map((item) => {
      let filter: any;

      if (assessmentType === 'manager') {
        filter = { emailOfResource: (item as BaseSkillsDto).emailOfResource };
      } else if (assessmentType === 'self') {
        filter = { email: (item as BaseSkillsDto).email };
      } else if (assessmentType === 'required') {
        filter = { careerLevel: (item as RequiredSkillsDto).careerLevel };
      } else {
        throw new Error('Invalid assessment type');
      }

      return {
        updateOne: {
          filter,
          update: {
            $set: {
              ...item,
              lastUpdated: new Date(),
            },
          },
          upsert: true,
        },
      };
    });

    this.logger.log(`Executing bulk write operation for ${operations.length} records`);
    return model.bulkWrite(operations, { ordered: false });
  }
}
