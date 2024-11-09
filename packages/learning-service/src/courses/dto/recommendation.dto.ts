import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CourseDetailsDto {
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

export class RecommendationDto {
  @IsString()
  skillName!: string;

  @IsNumber()
  currentLevel!: number;

  @IsNumber()
  targetLevel!: number;

  @IsNumber()
  gap!: number;

  course!: CourseDetailsDto;
}

export class RecommendationResponseDto {
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
