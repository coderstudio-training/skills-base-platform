import { BaseDto } from '@skills-base/shared';
import { Type as ValidateType } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

// Field definitions moved from interface
export interface Field {
  name: string;
  value: string;
}

// Validation error types moved from interface
export interface ValidationError {
  index: number;
  courseId: string;
  errors: string[];
}

// Bulk response type moved from interface
export interface BulkUpsertResponse {
  updatedCount: number;
  errors: any[];
  validationErrors?: ValidationError[];
}

// Type for field items
export class FieldDto extends BaseDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  value!: string;
}

export class CourseDto extends BaseDto {
  // The 5 static headers
  @IsString()
  @IsNotEmpty()
  skillCategory!: string;

  @IsString()
  @IsNotEmpty()
  skillName!: string;

  @IsNumber()
  @Min(1)
  @Max(6)
  requiredLevel!: number;

  @IsString()
  @IsNotEmpty()
  careerLevel!: string;

  @IsString()
  @IsNotEmpty()
  courseLevel!: string;

  @IsString()
  @IsNotEmpty()
  courseId!: string;

  // Dynamic fields array
  @IsArray()
  @ValidateNested({ each: true })
  @ValidateType(() => FieldDto)
  fields!: FieldDto[];
}

export class BulkUpdateCoursesDto extends BaseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ValidateType(() => CourseDto)
  data!: CourseDto[];

  @IsString()
  @IsNotEmpty()
  collection!: string;
}

export class GetCoursesQueryDto extends BaseDto {
  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  level?: string;
}
