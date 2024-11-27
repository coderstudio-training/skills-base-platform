import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
import { Course } from '../entity/courses.entity';

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
  @ApiProperty({
    description: 'Name of the field',
    example: 'provider',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Value of the field',
    example: 'ISTQB',
  })
  @IsString()
  value!: string;
}

export class CourseDto extends BaseDto {
  // The 5 static headers
  @ApiProperty({
    description: 'Category of the skill',
    example: 'Technical',
  })
  @IsString()
  @IsNotEmpty()
  skillCategory!: string;

  @ApiProperty({
    description: 'Name of the skill',
    example: 'Software Testing',
  })
  @IsString()
  @IsNotEmpty()
  skillName!: string;

  @ApiProperty({
    description: 'Required level for the skill',
    minimum: 1,
    maximum: 6,
    example: 3,
  })
  @IsNumber()
  @Min(1)
  @Max(6)
  requiredLevel!: number;

  @ApiProperty({
    description: 'Career level for the course',
    example: 'Professional III',
  })
  @IsString()
  @IsNotEmpty()
  careerLevel!: string;

  @ApiProperty({
    description: 'Level of the course',
    example: 'Intermediate',
  })
  @IsString()
  @IsNotEmpty()
  courseLevel!: string;

  @ApiProperty({
    description: 'Unique identifier for the course',
    example: 'COURSE-001',
  })
  @IsString()
  @IsNotEmpty()
  courseId!: string;

  // Dynamic fields array
  @ApiProperty({
    description: 'Additional fields for the course',
    type: [FieldDto],
    example: [
      { name: 'courseName', value: 'Advanced Test Analysis Techniques' },
      { name: 'provider', value: 'ISTQB' },
      { name: 'duration', value: '8 weeks' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ValidateType(() => FieldDto)
  fields!: FieldDto[];
}

export class BulkUpdateCoursesDto extends BaseDto {
  @ApiProperty({
    description: 'Array of courses to update or create',
    type: [CourseDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ValidateType(() => CourseDto)
  data!: CourseDto[];

  @ApiProperty({
    description: 'Name of the collection to update',
    example: 'QA_LEARNING_RESOURCES',
  })
  @IsString()
  @IsNotEmpty()
  collection!: string;
}

export class GetCoursesQueryDto extends BaseDto {
  @ApiPropertyOptional({
    description: 'Filter courses by skill category',
    example: 'Technical',
    required: false,
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    description: 'Filter courses by required level',
    example: '3',
    required: false,
  })
  @IsString()
  @IsOptional()
  level?: string;
}

export class ResourcesResponseDto extends BaseDto {
  @ApiProperty({
    description: 'List of learning resources/courses',
    type: [Course],
  })
  @IsArray()
  resources!: Course[];

  @ApiProperty({
    description: 'Total count of resources',
    example: 100,
  })
  @IsNumber()
  totalCount!: number;
}
