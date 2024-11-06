import { IsArray, IsOptional, IsString } from 'class-validator';

export class CourseRecommendationDto {
  @IsString()
  skillName: string;

  @IsString()
  courseName: string;

  @IsString()
  provider: string;

  @IsString()
  duration: string;

  @IsString()
  format: string;

  @IsString()
  @IsOptional()
  prerequisites?: string;

  @IsArray()
  @IsString({ each: true })
  learningObjectives: string[];
}

export class RecommendationResponseDto {
  success: boolean;
  recommendations: CourseRecommendationDto[];
  message?: string;
}
