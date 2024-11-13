import { BaseDto } from '@skills-base/shared';
import { Type as ValidateType } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

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
