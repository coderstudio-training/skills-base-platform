import { Type as ValidateType } from 'class-transformer';  // Changed this line
import { IsString, IsNotEmpty, IsNumber, IsArray, IsOptional, Min, Max, ValidateNested } from 'class-validator';

export class CourseDto {
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  courseName: string;

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
  provider: string;

  @IsString()
  @IsNotEmpty()
  duration: string;

  @IsString()
  @IsNotEmpty()
  format: string;

  @IsString()
  @IsOptional()
  prerequisites?: string;

  @IsString()
  @IsOptional()
  learningObjectives?: string;

  @IsString()
  @IsOptional()
  assessment?: string;

  @IsString()
  @IsOptional()
  certificationOption?: string;

  @IsString()
  @IsOptional()
  businessValue?: string;

  @IsString()
  @IsOptional()
  recommendedFor?: string;
}

export class BulkUpdateCoursesDto {
    @IsArray()
    @ValidateNested({ each: true })
    @ValidateType(() => CourseDto)  
    data: CourseDto[];
  }