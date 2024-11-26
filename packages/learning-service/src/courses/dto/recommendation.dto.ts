import { BaseDto } from '@skills-base/shared';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CourseDetailsDto extends BaseDto {
  @IsString()
  name!: string;

  @IsString()
  provider!: string;

  @IsString()
  duration!: string;

  @IsString()
  format!: string;

  @IsString()
  learningPath!: string;

  @IsArray()
  @IsString({ each: true })
  learningObjectives!: string[];

  @IsString()
  prerequisites!: string;

  @IsString()
  businessValue!: string;
}

export class RecommendationDto extends BaseDto {
  @IsString()
  skillName!: string;

  @IsNumber()
  currentLevel!: number;

  @IsNumber()
  targetLevel!: number;

  @IsNumber()
  gap!: number;

  @IsString()
  type!: 'skillGap' | 'promotion';

  course!: CourseDetailsDto;
}

export class RecommendationResponseDto extends BaseDto {
  @IsBoolean()
  success!: boolean;

  @IsString()
  employeeName!: string;

  @IsString()
  careerLevel!: string;

  @IsArray()
  recommendations!: RecommendationDto[];

  @IsDate()
  generatedDate!: Date;

  @IsString()
  @IsOptional()
  message?: string;
}
