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

  // Define validation rules for dynamic fields
  private readonly DYNAMIC_FIELD_VALIDATIONS: Record<string, { 
    validate: (value: string) => boolean;
    message: string;
  }> = {
    duration: {
      validate: (value: string) => /^\d+\s+(weeks?|months?)$/i.test(value),
      message: 'Duration must be in format: "X weeks" or "X months"'
    },
    learningObjectives: {
      validate: (value: string) => value.includes(','),
      message: 'Learning objectives should be comma-separated'
    },
    prerequisites: {
      validate: (value: string) => value.length > 0,
      message: 'Prerequisites should not be empty'
    },
    assessment: {
      validate: (value: string) => value.length > 0,
      message: 'Assessment should not be empty'
    },
    provider: {
      validate: (value: string) => value.length > 0,
      message: 'Provider should not be empty'
    },
    businessValue: {
      validate: (value: string) => value.length > 0,
      message: 'Business value should not be empty'
    },
    recommendedFor: {
      validate: (value: string) => /^Current Level < \d+$/.test(value),
      message: 'RecommendedFor should be in format "Current Level < X"'
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

    // Static fields validation
    if (!course.courseName?.trim()) {
      errors.push('courseName is required');
    }
    if (!course.skillCategory?.trim()) {
      errors.push('skillCategory is required');
    }
    if (!course.skillName?.trim()) {
      errors.push('skillName is required');
    }
    if (!course.careerLevel?.trim()) {
      errors.push('careerLevel is required');
    }
    if (!course.courseLevel?.trim()) {
      errors.push('courseLevel is required');
    }

    if (typeof course.requiredLevel !== 'number') {
      errors.push('requiredLevel must be a number');
    } else if (course.requiredLevel < 1 || course.requiredLevel > 6) {
      errors.push('requiredLevel must be between 1 and 6');
    }

    // Dynamic fields validation
    Object.entries(course).forEach(([field, value]) => {
      const validator = this.DYNAMIC_FIELD_VALIDATIONS[field.toLowerCase()];
      if (validator && value !== undefined && value !== null && value !== '') {
        if (!validator.validate(value)) {
          errors.push(validator.message);
        }
      }
    });

    return errors;
  }

  
  //bulkUpsert main function
  async bulkUpsert(bulkUpdateDto: BulkUpdateCoursesDto): Promise<BulkUpsertResponse> {
    let totalUpdatedCount = 0;
    const errors = [];
    const validationErrors: ValidationError[] = [];

    // Validate all courses first
    bulkUpdateDto.data.forEach((course, index) => {
      const courseErrors = this.validateCourse(course);
      if (courseErrors.length > 0) {
        validationErrors.push({
          index,
          courseId: course.courseId,
          errors: courseErrors
        });
      }
    });

    // If there are validation errors, return them without processing
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
      } catch (error) {
        this.logger.error(`Error processing batch ${i / this.BATCH_SIZE + 1}: ${error.message}`);
        errors.push({ batchIndex: i / this.BATCH_SIZE + 1, error: error.message });
      }
    }

    return {updatedCount: totalUpdatedCount, errors, validationErrors };
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