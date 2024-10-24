import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BulkWriteResult } from 'mongodb'; // Import BulkWriteResult from mongodb
import { Model } from 'mongoose'; // Import Model only
import {
  BulkUpdateSelfSkillsDto,
  SelfSkillsDto,
} from './dto/assessments.dto';
import { SelfSkills } from './entities/assessments.entity';

@Injectable()
export class SelfSkillsService {
  private readonly logger = new Logger(SelfSkillsService.name);
  private readonly BATCH_SIZE = 1000;

  constructor(
    @InjectModel(SelfSkills.name)
    private SelfSkillsModel: Model<SelfSkills>,
  ) {
    this.ensureIndexes();
  }

  private async ensureIndexes(): Promise<void> {
    try {
      await this.SelfSkillsModel.collection.createIndex(
        { email: 1 }, // Unique index for email
        { unique: true, background: true },
      );
      this.logger.log('Indexes ensured for SelfSkills collection');
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Error ensuring indexes: ${error.message}`);
      } else {
        this.logger.error('An unknown error occurred while ensuring indexes.');
      }
    }
  }

  async bulkUpsert(
    bulkUpdateDto: BulkUpdateSelfSkillsDto,
  ): Promise<{ updatedCount: number; errors: any[] }> {
    let totalUpdatedCount = 0;
    const errors = [];

    for (let i = 0; i < bulkUpdateDto.data.length; i += this.BATCH_SIZE) {
      const batch = bulkUpdateDto.data.slice(i, i + this.BATCH_SIZE);
      try {
        const result = await this.processBatch(batch);
        totalUpdatedCount += result.modifiedCount + result.upsertedCount;
      } catch (error: unknown) {
        if (error instanceof Error) {
          this.logger.error(
            `Error processing batch ${i / this.BATCH_SIZE + 1}: ${error.message}`,
          );
          errors.push({
            batchIndex: i / this.BATCH_SIZE + 1,
            error: error.message,
          });
        } else {
          this.logger.error(
            `Error processing batch ${i / this.BATCH_SIZE + 1}: An unknown error occurred.`,
          );
          errors.push({
            batchIndex: i / this.BATCH_SIZE + 1,
            error: 'An unknown error occurred.',
          });
        }
      }
    }

    return { updatedCount: totalUpdatedCount, errors };
  }

  private async processBatch(
    batch: SelfSkillsDto[],
  ): Promise<BulkWriteResult> {
    const operations = batch.map((item) => ({
      updateOne: {
        filter: { email: item.email }, // Using email as the unique identifier
        update: {
          $set: {
            timestamp: new Date(item.timestamp), // Convert string to Date
            resourceName: item.resourceName,
            capability: item.capability,
            careerLevel: item.careerLevel,
            skills: item.skills, // Directly assign the skills map
            lastUpdated: new Date(),
          },
        },
        upsert: true,
      },
    }));

    const result = await this.SelfSkillsModel.bulkWrite(operations, {
      ordered: false,
    });
    this.logger.debug(
      `Batch processed: ${result.modifiedCount} updated, ${result.upsertedCount} inserted`,
    );
    return result;
  }

  async findAll(): Promise<SelfSkills[]> {
    return this.SelfSkillsModel.find().exec();
  }

  async findByEmail(email: string): Promise<SelfSkills | null> {
    return this.SelfSkillsModel.findOne({ email }).exec(); // Updated to search by email
  }

  async getSkillsDistribution(): Promise<Record<string, number>> {
    const pipeline = [
      { $unwind: { path: '$skills', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$skills.name', avgLevel: { $avg: '$skills.level' } } },
      { $project: { _id: 0, skill: '$_id', avgLevel: 1 } },
    ];

    const result = await this.SelfSkillsModel.aggregate(pipeline);
    return result.reduce((acc, { skill, avgLevel }) => {
      acc[skill] = avgLevel;
      return acc;
    }, {});
  }
}
