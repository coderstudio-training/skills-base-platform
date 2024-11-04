import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { mongo } from 'mongoose';
import { Connection, Model, Schema } from 'mongoose';
import {
  BaseAssessmentDto,
  BulkUpdateAssessmentsDto,
} from './dto/assessments.dto';
import {
  ManagerAssessmentSchema,
  SelfAssessmentSchema,
} from './entities/assessments.entity';
// import { RequiredSkillsSchema } from './entities/required-skills.entity';

@Injectable()
export class AssessmentsService {
  private readonly logger = new Logger(AssessmentsService.name);
  private readonly BATCH_SIZE = 1000;

  constructor(@InjectConnection() private readonly connection: Connection) {}

  private getSchemaForAssessmentType(assessmentType: string): Schema<any> {
    if (assessmentType === 'self') {
      return SelfAssessmentSchema;
    } else if (assessmentType === 'manager') {
      return ManagerAssessmentSchema;
    }
    // else if (assessmentType === 'required') {
    //   return RequiredSkillsSchema;
    // }
    else {
      throw new BadRequestException(
        `Invalid assessment type: ${assessmentType}`,
      );
    }
  }

  private getModelForAssessmentType(
    prefixBU: string,
    assessmentType: string,
  ): Model<any> {
    const collectionName = `${prefixBU}_${assessmentType}_Assessments`;

    if (!this.connection.models[collectionName]) {
      const schema = this.getSchemaForAssessmentType(assessmentType);
      const model = this.connection.model(collectionName, schema);
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
    }
    // else if (model.modelName.includes('required')) {
    //   await model.collection.createIndex({ careerLevel: 1 }, { unique: true, background: true });
    // }
  }

  async bulkUpsert(
    prefixBU: string,
    assessmentType: string,
    bulkUpdateDto: BulkUpdateAssessmentsDto,
  ): Promise<{ updatedCount: number; errors: any[] }> {
    const model = this.getModelForAssessmentType(prefixBU, assessmentType);
    let totalUpdatedCount = 0;
    const errors = [];

    if (
      !bulkUpdateDto ||
      !bulkUpdateDto.data ||
      !Array.isArray(bulkUpdateDto.data)
    ) {
      this.logger.error('Invalid bulk update data provided');
      throw new BadRequestException('Invalid data format for bulk update');
    }

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

  private async processBatch(
    model: Model<any>,
    batch: BaseAssessmentDto[],
    assessmentType: string,
  ): Promise<mongo.BulkWriteResult> {
    const operations = batch.map((item) => {
      let filter: any;

      if (assessmentType === 'manager') {
        filter = { emailOfResource: item.emailOfResource };
      } else if (assessmentType === 'self') {
        filter = { emailAddress: item.emailAddress };
        // } else if (assessmentType === 'required') {
        //   filter = { careerLevel: item.careerLevel };
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

    return model.bulkWrite(operations, { ordered: false });
  }
}
