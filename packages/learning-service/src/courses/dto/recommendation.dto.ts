import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Name of the course',
    example: 'Advanced Test Analysis Techniques',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Course provider/vendor',
    example: 'ISTQB',
  })
  @IsString()
  provider!: string;

  @ApiProperty({
    description: 'Duration of the course',
    example: '8 weeks',
  })
  @IsString()
  duration!: string;

  @ApiProperty({
    description: 'Course format/delivery method',
    example: 'Online + Labs',
  })
  @IsString()
  format!: string;

  @ApiProperty({
    description: 'Learning path description',
    example: 'This course will help you progress from level 2.0 to level 3.0',
  })
  @IsString()
  learningPath!: string;

  @ApiProperty({
    description: 'Learning objectives of the course',
    example: ['Advanced test techniques', 'Risk-based testing', 'Test metrics'],
  })
  @IsArray()
  @IsString({ each: true })
  learningObjectives!: string[];

  @ApiProperty({
    description: 'Course prerequisites',
    example: 'ISTQB Foundation',
  })
  @IsString()
  prerequisites!: string;

  @ApiProperty({
    description: 'Business value/outcome of the course',
    example: 'Enhanced test coverage',
  })
  @IsString()
  businessValue!: string;
}

export class RecommendationDto extends BaseDto {
  @ApiProperty({
    description: 'Name of the skill',
    example: 'Software Testing',
  })
  @IsString()
  skillName!: string;

  @ApiProperty({
    description: 'Current skill level',
    example: 2.5,
  })
  @IsNumber()
  currentLevel!: number;

  @ApiProperty({
    description: 'Target skill level',
    example: 3,
  })
  @IsNumber()
  targetLevel!: number;

  @ApiProperty({
    description: 'Skill level gap',
    example: -0.5,
  })
  @IsNumber()
  gap!: number;

  @ApiProperty({
    description: 'Type of recommendation',
    enum: ['skillGap', 'promotion'],
    example: 'skillGap',
  })
  @IsString()
  type!: 'skillGap' | 'promotion';

  @ApiProperty({
    description: 'Course details for the recommendation',
    type: () => CourseDetailsDto,
  })
  course!: CourseDetailsDto;
}

export class RecommendationResponseDto extends BaseDto {
  @ApiProperty({
    description: 'Indicates if recommendations were successfully generated',
    example: true,
  })
  @IsBoolean()
  success!: boolean;

  @ApiProperty({
    description: 'Name of the employee',
    example: 'John Doe',
  })
  @IsString()
  employeeName!: string;

  @ApiProperty({
    description: 'Current career level of the employee',
    example: 'Professional III',
  })
  @IsString()
  careerLevel!: string;

  @ApiProperty({
    description: 'List of course recommendations',
    type: [RecommendationDto],
  })
  @IsArray()
  recommendations!: RecommendationDto[];

  @ApiProperty({
    description: 'When the recommendations were generated',
    example: '2024-11-27T10:00:00.000Z',
  })
  @IsDate()
  generatedDate!: Date;

  @ApiPropertyOptional({
    description: 'Additional message (if any)',
    example: 'No skill gap data found for the employee',
  })
  @IsString()
  @IsOptional()
  message?: string;
}
