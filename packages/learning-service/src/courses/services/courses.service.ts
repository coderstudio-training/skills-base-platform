import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { mongo } from 'mongoose';
import { Connection, Model } from 'mongoose';
import {
  BulkUpdateCoursesDto,
  BulkUpsertResponse,
  CourseDto,
  ValidationError,
} from '../dto/courses.dto';
import { Course, CourseSchema } from '../entity/courses.entity';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);
  private readonly BATCH_SIZE = 1000;
  // This cache stores our dynamic models to avoid recreating them
  private modelCache: Map<string, Model<Course>> = new Map();

  constructor(@InjectConnection() private readonly connection: Connection) {}

  private async getModelForCollection(
    collection: string,
  ): Promise<Model<Course>> {
    if (this.modelCache.has(collection)) {
      return this.modelCache.get(collection)!;
    }
    //create a new model
    const model = this.connection.model<Course>(
      `Course_${collection}`,
      CourseSchema,
      collection,
    );

    // Set up indexes for this new collection
    await this.ensureIndexes(model);
    // Cache the model
    this.modelCache.set(collection, model);
    return model;
  }

  private async ensureIndexes(model: Model<Course>): Promise<void> {
    try {
      await model.collection.createIndex(
        { courseId: 1 },
        { unique: true, background: true },
      );
      this.logger.log(
        `Indexes ensured for collection: ${model.collection.collectionName}`,
      );
    } catch (error: any) {
      this.logger.error(`Error ensuring indexes: ${error.message}`);
    }
  }

  private validateCourse(course: CourseDto): string[] {
    const errors: string[] = [];
    const requiredFields = [
      'skillCategory',
      'skillName',
      'requiredLevel',
      'careerLevel',
      'courseLevel',
      'courseId',
    ];

    for (const field of requiredFields) {
      if (!course[field as keyof CourseDto]) {
        errors.push(`${field} is required`);
      }
    }

    // Keep only essential business rule
    if (
      course.requiredLevel &&
      (course.requiredLevel < 1 || course.requiredLevel > 6)
    ) {
      errors.push('Required level must be between 1 and 6');
    }

    return errors;
  }

  async bulkUpsert(
    bulkUpdateDto: BulkUpdateCoursesDto,
  ): Promise<BulkUpsertResponse> {
    if (!bulkUpdateDto.collection) {
      throw new Error('Collection name is required');
    }

    const model = await this.getModelForCollection(bulkUpdateDto.collection);
    let totalUpdatedCount = 0;
    const errors = [];
    const validationErrors: ValidationError[] = [];

    // Validate all courses
    bulkUpdateDto.data.forEach((course, index) => {
      const courseErrors = this.validateCourse(course);
      if (courseErrors.length > 0) {
        validationErrors.push({
          index,
          courseId: course.courseId,
          errors: courseErrors,
        });
        this.logger.debug(
          `Validation errors for course ${course.courseId}:`,
          courseErrors,
        );
      }
    });

    // Return early if validation fails
    if (validationErrors.length > 0) {
      return {
        updatedCount: 0,
        errors: [],
        validationErrors,
      };
    }

    // Process valid courses in batches
    for (let i = 0; i < bulkUpdateDto.data.length; i += this.BATCH_SIZE) {
      const batch = bulkUpdateDto.data.slice(i, i + this.BATCH_SIZE);
      try {
        const result = await this.processBatch(batch, model);
        totalUpdatedCount += result.modifiedCount + result.upsertedCount;
        this.logger.debug(
          `Processed batch ${i / this.BATCH_SIZE + 1}: ${result.modifiedCount + result.upsertedCount} records`,
        );
      } catch (error: any) {
        const errorMessage = `Error processing batch ${i / this.BATCH_SIZE + 1}: ${error.message}`;
        this.logger.error(errorMessage);
        errors.push({
          batchIndex: i / this.BATCH_SIZE + 1,
          error: error.message,
        });
      }
    }

    return { updatedCount: totalUpdatedCount, errors, validationErrors };
  }

  private async processBatch(
    batch: CourseDto[],
    model: Model<Course>,
  ): Promise<mongo.BulkWriteResult> {
    const operations = batch.map((item) => ({
      updateOne: {
        filter: { courseId: item.courseId },
        update: {
          $set: {
            ...item,
            lastUpdated: new Date(),
          },
        },
        upsert: true,
      },
    }));

    return model.bulkWrite(operations, { ordered: false });
  }
}
