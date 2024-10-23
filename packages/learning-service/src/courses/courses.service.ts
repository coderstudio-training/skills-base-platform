import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { BulkWriteResult } from 'mongodb'; 
import { Course } from './entity/courses.entity';
import { BulkUpdateCoursesDto, CourseDto } from './dto/courses.dto';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);
  private readonly BATCH_SIZE = 1000;

  constructor(
    @InjectModel(Course.name) private courseModel: Model<Course>
  ) {
    this.ensureIndexes();
  }

  private async ensureIndexes(): Promise<void> {
    try {
      await this.courseModel.collection.createIndex(
        { courseId: 1 },
        { unique: true, background: true }
      );
      this.logger.log('Indexes ensured for Courses collection');
    } catch (error) {
      this.logger.error(`Error ensuring indexes: ${error.message}`);
    }
  }

  async bulkUpsert(bulkUpdateDto: BulkUpdateCoursesDto): Promise<{ updatedCount: number, errors: any[] }> {
    let totalUpdatedCount = 0;
    const errors = [];

    for (let i = 0; i < bulkUpdateDto.data.length; i += this.BATCH_SIZE) {
      const batch = bulkUpdateDto.data.slice(i, i + this.BATCH_SIZE);
      try {
        const result = await this.processBatch(batch);
        totalUpdatedCount += result.modifiedCount + result.upsertedCount;
      } catch (error) {
        this.logger.error(`Error processing batch ${i / this.BATCH_SIZE + 1}: ${error.message}`);
        errors.push({ batchIndex: i / this.BATCH_SIZE + 1, error: error.message });
      }
    }

    return { updatedCount: totalUpdatedCount, errors };
  }

  private async processBatch(batch: CourseDto[]): Promise<BulkWriteResult> {
    const operations = batch.map(item => ({
      updateOne: {
        filter: { courseId: item.courseId },
        update: { $set: { ...item, lastUpdated: new Date() } },
        upsert: true
      }
    }));

    return this.courseModel.bulkWrite(operations, { ordered: false });
  }
  
  async findAll(): Promise<Course[]> {
    return this.courseModel.find().exec();
  }
}
