import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { mongo } from 'mongoose';
import { Connection, Model, Schema } from 'mongoose';
import {
  BaseAssessmentDto,
  BulkUpdateAssessmentsDto,
  BulkUpdateSkillGapsDto,
  SkillGapsDto,
} from '../dto/assessments.dto';
import {
  ManagerAssessmentSchema,
  SelfAssessmentSchema,
} from '../entities/assessments.entity';
import { SkillGapsSchema } from '../entities/skill-gaps.entity';
import { SkillsMatrixService } from './skills-matrix.service';

@Injectable()
export class AssessmentsService {
  private readonly logger = new Logger(AssessmentsService.name);
  private readonly BATCH_SIZE = 1000;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly skillsMatrixService: SkillsMatrixService,
  ) {}
  private getSchemaForAssessmentType(assessmentType: string): Schema<any> {
    if (assessmentType === 'manager') {
      return ManagerAssessmentSchema;
    } else if (assessmentType === 'self') {
      return SelfAssessmentSchema;
    } else if (assessmentType === 'gap') {
      return SkillGapsSchema;
    } else {
      throw new BadRequestException(
        `Invalid assessment type: ${assessmentType}`,
      );
    }
  }

  private getModelForAssessmentType(
    // prefixBU: string,
    assessmentType: string,
  ): Model<any> {
    const collectionName = `Capability_${assessmentType}Assessments`;

    if (!this.connection.models[collectionName]) {
      const schema = this.getSchemaForAssessmentType(assessmentType);
      const model = this.connection.model(
        collectionName,
        schema,
        collectionName,
      );
      this.ensureModelIndexes(model); // Create indexes after creating the model
    }

    return this.connection.models[collectionName];
  }

  private async ensureModelIndexes(model: Model<any>): Promise<void> {
    if (model.modelName.includes('manager')) {
      await model.collection.createIndex(
        { emailOfResource: 1 },
        { unique: true, background: true },
      );
    } else if (model.modelName.includes('self')) {
      await model.collection.createIndex(
        { emailAddress: 1 },
        { unique: true, background: true },
      );
    } else if (model.modelName.includes('gap')) {
      await model.collection.createIndex(
        { emailAddress: 1 },
        { unique: true, background: true },
      );
    }
  }

  async bulkUpsert(
    assessmentType: string,
    bulkUpdateDto: BulkUpdateAssessmentsDto | BulkUpdateSkillGapsDto,
  ): Promise<{ updatedCount: number; errors: any[] }> {
    const model = this.getModelForAssessmentType(assessmentType);
    let totalUpdatedCount = 0;
    const errors = [];

    if (!bulkUpdateDto?.data || !Array.isArray(bulkUpdateDto.data)) {
      throw new BadRequestException('Invalid data format for bulk update');
    }

    try {
      for (let i = 0; i < bulkUpdateDto.data.length; i += this.BATCH_SIZE) {
        const batch = bulkUpdateDto.data.slice(i, i + this.BATCH_SIZE);
        try {
          const result = await this.processBatch(model, batch, assessmentType);
          totalUpdatedCount += result.modifiedCount + result.upsertedCount;
        } catch (error) {
          this.logger.error('Error processing batch', error);
          errors.push({ error });
        }
      }
      return { updatedCount: totalUpdatedCount, errors };
    } catch (error) {
      this.logger.error('Error in bulk upsert operation:', error);
      throw error;
    }
  }

  private async processBatch(
    model: Model<any>,
    batch: BaseAssessmentDto[] | SkillGapsDto[],
    assessmentType: string,
  ): Promise<mongo.BulkWriteResult> {
    const operations = batch.map((item) => {
      let filter: any;
      let updateData: any = { ...item };

      if (assessmentType === 'gap') {
        filter = { emailAddress: item.emailAddress };
        // For gap assessments, reorganize the data if needed
        if ('skillAverages' in item && 'skillGaps' in item) {
          updateData = {
            ...item,
            lastUpdated: new Date(),
          };
        }
      } else {
        if (assessmentType === 'manager') {
          filter = { emailOfResource: item.emailOfResource };
        } else {
          filter = { emailAddress: item.emailAddress };
        }
        updateData = {
          ...item,
          lastUpdated: new Date(),
        };
      }

      return {
        updateOne: {
          filter,
          update: { $set: updateData },
          upsert: true,
        },
      };
    });

    return model.bulkWrite(operations, { ordered: false });
  }
}
