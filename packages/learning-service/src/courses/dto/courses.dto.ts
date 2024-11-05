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
export class FieldDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  value: string;
}

export class CourseDto {
  // The 5 static headers
  @IsString()
  @IsNotEmpty()
  skillCategory: string;

  @IsString()
  @IsNotEmpty()
  skillName: string;

  @IsNumber()
  @Min(1)
  @Max(6)
  requiredLevel: number;

  @IsString()
  @IsNotEmpty()
  careerLevel: string;

  @IsString()
  @IsNotEmpty()
  courseLevel: string;

  @IsString()
  @IsNotEmpty()
  courseId: string;

  // Dynamic fields array
  @IsArray()
  @ValidateNested({ each: true })
  @ValidateType(() => FieldDto)
  fields: FieldDto[];
}

export class BulkUpdateCoursesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ValidateType(() => CourseDto)
  data: CourseDto[];

  @IsString()
  @IsNotEmpty()
  collection: string;
}
