import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { mongo } from 'mongoose';
import { Connection, Model } from 'mongoose';
import {
  BulkUpdateCoursesDto,
  BulkUpsertResponse,
  CourseDto,
  GetCoursesQueryDto,
  ResourcesResponseDto,
  ValidationError,
} from '../dto/courses.dto';
import { Course, CourseSchema } from '../entity/courses.entity';

/**
 * Service responsible for managing course-related operations.
 * Handles CRUD operations, bulk updates, and querying of course data.
 * Uses dynamic model creation for flexible collection management.
 */
@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);
  // Maximum number of documents to process in a single batch
  private readonly BATCH_SIZE = 1000;

  constructor(@InjectConnection() private readonly connection: Connection) {}

  /**
   * Gets or creates a Mongoose model for a specific collection.
   * Uses caching to avoid recreating models for the same collection.
   *
   * @param collection - Name of the MongoDB collection
   * @returns Promise resolving to a Mongoose model for the collection
   */

  private async getModelForCollection(
    collection: string,
  ): Promise<Model<Course>> {
    const model = this.connection.model<Course>(
      `Course_${collection}`,
      CourseSchema,
      collection,
    );

    // Set up indexes for this new collection
    await this.ensureIndexes(model);
    return model;
  }

  /**
   * Creates necessary indexes for a course collection.
   * Ensures courseId is unique and indexed for efficient queries.
   *
   * @param model - Mongoose model to create indexes for
   */
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
  /**
   * Validates a course object against required fields and business rules.
   *
   * @param course - CourseDto object to validate
   * @returns Array of validation error messages, empty if validation passes
   */
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

    // Validate required Level Range
    if (
      course.requiredLevel &&
      (course.requiredLevel < 1 || course.requiredLevel > 6)
    ) {
      errors.push('Required level must be between 1 and 6');
    }

    return errors;
  }

  /**
   * Performs bulk upsert operation for multiple courses.
   * Includes validation, batching, and error handling.
   *
   * @param bulkUpdateDto - Contains collection name and array of courses to upsert
   * @returns Promise resolving to response containing update counts and any errors
   * @throws Error if collection name is not provided
   */
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

  /**
   * Processes a batch of courses using MongoDB bulk write operations.
   *
   * @param batch - Array of courses to process
   * @param model - Mongoose model to use for the operation
   * @returns Promise resolving to bulk write result
   */
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

  /**
   * Retrieves courses based on category and level filters.
   *
   * @param param0 - Object containing optional category and level filters
   * @returns Promise resolving to array of filtered courses
   */
  async getCourses({ category, level }: GetCoursesQueryDto): Promise<Course[]> {
    try {
      const model = await this.getModelForCollection('qa_courses');

      const filterQuery = {} as any;

      // Category Filter Logic
      if (category && category !== 'All Categories') {
        filterQuery.skillCategory = category;
        this.logger.debug(`Filtering by category: ${category}`);
      }

      // Level Filter Logic
      if (level && level !== 'All Levels') {
        filterQuery.requiredLevel = parseInt(level);
        this.logger.debug(`Filtering by level: ${level}`);
      }

      // Execute query with sorting
      const query = model
        .find(filterQuery)
        .sort({ skillCategory: 1, requiredLevel: 1 });

      const results = await query.exec();
      return results;
    } catch (error: any) {
      this.logger.error(`Error fetching courses: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retrieves learning resources with optional category filtering.
   * Includes total count of resources matching the filter.
   *
   * @param category - Optional category to filter resources
   * @returns Promise resolving to resources and total count
   */
  async getResources(category?: string): Promise<ResourcesResponseDto> {
    try {
      const model = await this.getModelForCollection('qa_courses');

      const filter: any = {};
      if (category) {
        filter.skillCategory = category;
        this.logger.debug(`Filtering resources by category: ${category}`);
      }
      // Parallel execution of find and count operations
      const [resources, totalCount] = await Promise.all([
        model.find(filter).sort({ skillCategory: 1 }).lean().exec(),
        model.countDocuments(filter),
      ]);

      this.logger.debug(
        `Found ${totalCount} resources for ${category || 'all categories'}`,
      );

      return {
        resources,
        totalCount,
      } as ResourcesResponseDto;
    } catch (error: any) {
      this.logger.error(`Error fetching resources: ${error.message}`);
      throw error;
    }
  }
}
