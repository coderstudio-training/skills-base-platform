import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { BulkWriteResult } from 'mongodb';
import { Model } from 'mongoose';
import { BulkUpsertResponse, ValidationError } from './courses.interface';
import { BulkUpdateCoursesDto, CourseDto } from './dto/courses.dto';
import { Course } from './entity/courses.entity';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);
  private readonly BATCH_SIZE = 1000;

  // Basic field requirements (from n8n)
  private readonly REQUIRED_FIELDS = {
    courseName: 'string',
    skillCategory: 'string',
    skillName: 'string',
    requiredLevel: 'number',
    careerLevel: 'string',
    courseLevel: 'string'
  } as const;

  // Simple business rules
  private readonly BUSINESS_RULES: Record<string, {
    validate: (value: any) => boolean;
    message: string;
  }> = {
    requiredLevel: {
      validate: (value: unknown) => {
        const numValue = Number(value);
        return !isNaN(numValue) && numValue >= 1 && numValue <= 6;
      },
      message: 'Required level must be between 1 and 6'
    },
    courseLevel: {
      validate: (value: unknown) => {
        return typeof value === 'string' && 
          ['Foundation', 'Intermediate', 'Advanced', 'Executive'].includes(value);
      },
      message: 'Course level must be Foundation, Intermediate, Advanced or Executive'
    },
    careerLevel: {
      validate: (value: unknown) => {
        return typeof value === 'string' && 
          (value.includes('Professional') || 
           value.includes('Manager') || 
           value.includes('Director'));
      },
      message: 'Career level must contain Professional, Manager, or Director'
    }
  };

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

  private validateCourse(course: CourseDto): string[] {
    const errors: string[] = [];

    // 1. Basic field validation (from n8n)
    Object.entries(this.REQUIRED_FIELDS).forEach(([fieldName, expectedType]) => {
      const value = course[fieldName as keyof CourseDto];
      
      if (!value && value !== 0) {
        errors.push(`${fieldName} is required`);
        return;
      }

      if (typeof value !== expectedType) {
        errors.push(`${fieldName} must be a ${expectedType}`);
        return;
      }
    });

    // 2. Business rules validation
    Object.entries(this.BUSINESS_RULES).forEach(([fieldName, rule]) => {
      const value = course[fieldName as keyof CourseDto];
      if (value && !rule.validate(value)) {
        errors.push(rule.message);
      }
    });

    return errors;
  }

  async bulkUpsert(bulkUpdateDto: BulkUpdateCoursesDto): Promise<BulkUpsertResponse> {
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
          errors: courseErrors
        });
        this.logger.debug(`Validation errors for course ${course.courseId}:`, courseErrors);
      }
    });

    // Return early if validation fails
    if (validationErrors.length > 0) {
      return {
        updatedCount: 0,
        errors: [],
        validationErrors
      };
    }

    // Process valid courses in batches
    for (let i = 0; i < bulkUpdateDto.data.length; i += this.BATCH_SIZE) {
      const batch = bulkUpdateDto.data.slice(i, i + this.BATCH_SIZE);
      try {
        const result = await this.processBatch(batch);
        totalUpdatedCount += result.modifiedCount + result.upsertedCount;
        this.logger.debug(`Processed batch ${i / this.BATCH_SIZE + 1}: ${result.modifiedCount + result.upsertedCount} records`);
      } catch (error) {
        const errorMessage = `Error processing batch ${i / this.BATCH_SIZE + 1}: ${error.message}`;
        this.logger.error(errorMessage);
        errors.push({ batchIndex: i / this.BATCH_SIZE + 1, error: error.message });
      }
    }

    return { updatedCount: totalUpdatedCount, errors, validationErrors };
  }

  private async processBatch(batch: CourseDto[]): Promise<BulkWriteResult> {
    const operations = batch.map(item => ({
      updateOne: {
        filter: { courseId: item.courseId },
        update: { 
          $set: { 
            ...item,
            lastUpdated: new Date()
          }
        },
        upsert: true
      }
    }));

    return this.courseModel.bulkWrite(operations, { ordered: false });
  }
}