import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum SkillCategory {
  TECHNICAL = 'Technical Skills',
  SOFT = 'Soft Skills',
}

export enum SkillStatus {
  PROFICIENT = 'Proficient',
  DEVELOPING = 'Developing',
}

export class SkillDetailsDto {
  @ApiProperty({
    description: 'Name of the skill',
    example: 'problemSolving',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Category of the skill (Technical/Soft)',
    enum: SkillCategory,
    example: SkillCategory.TECHNICAL,
  })
  @IsEnum(SkillCategory)
  category!: SkillCategory;

  @ApiProperty({
    description: 'Self assessment rating',
    example: 4,
    minimum: 0,
    maximum: 5,
  })
  @IsNumber()
  @Min(0)
  @Max(5)
  selfRating!: number;

  @ApiProperty({
    description: 'Manager assessment rating',
    example: 4,
    minimum: 0,
    maximum: 5,
  })
  @IsNumber()
  @Min(0)
  @Max(5)
  managerRating!: number;

  @ApiProperty({
    description: 'Average of self and manager ratings',
    example: 4,
  })
  @IsNumber()
  average!: number;

  @ApiProperty({
    description: 'Skill gap value',
    example: 0,
  })
  @IsNumber()
  gap!: number;

  @ApiProperty({
    description: 'Required skill level for current career level and capability',
    example: 4,
    minimum: 0,
    maximum: 5,
  })
  @IsNumber()
  @Min(0)
  @Max(5)
  required!: number;
  @ApiProperty({
    description: 'Status of skill proficiency',
    enum: SkillStatus,
    example: SkillStatus.PROFICIENT,
  })
  @IsEnum(SkillStatus)
  status!: SkillStatus;
}

export class CategorySkillsSummaryDto {
  @ApiProperty({
    description: 'Average gap for skills in this category',
    example: 0.5,
  })
  @IsNumber()
  averageGap!: number;

  @ApiProperty({
    description: 'Count of skills meeting required levels in this category',
    example: 5,
  })
  @IsNumber()
  @Min(0)
  skillsMeetingRequired!: number;

  @ApiProperty({
    description: 'Count of skills needing improvement in this category',
    example: 2,
  })
  @IsNumber()
  @Min(0)
  skillsNeedingImprovement!: number;

  @ApiProperty({
    description: 'Largest gap in this category',
    example: -2,
  })
  @IsNumber()
  largestGap!: number;

  @ApiProperty({
    description: 'Average rating for skills in this category',
    example: 4.2,
  })
  @IsNumber()
  averageRating!: number;

  @ApiProperty({
    description: 'Total number of skills assessed in this category',
    example: 7,
  })
  @IsNumber()
  @Min(0)
  totalSkills!: number;
}

export class SkillsSummaryDto {
  @ApiProperty({
    description: 'Overall skills summary',
    type: CategorySkillsSummaryDto,
  })
  overall!: CategorySkillsSummaryDto;

  @ApiProperty({
    description: 'Technical skills summary',
    type: CategorySkillsSummaryDto,
  })
  technicalSkills!: CategorySkillsSummaryDto;

  @ApiProperty({
    description: 'Soft skills summary',
    type: CategorySkillsSummaryDto,
  })
  softSkills!: CategorySkillsSummaryDto;
}

export class EmployeeSkillsResponseDto {
  @ApiProperty({
    description: 'Employee email address',
    example: 'john.doe@company.com',
  })
  @IsString()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'Employee name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Employee career level',
    example: 'Professional IV',
  })
  @IsString()
  @IsNotEmpty()
  careerLevel!: string;

  @ApiProperty({
    description: 'Employee capability/department',
    example: 'QA',
  })
  @IsString()
  @IsNotEmpty()
  capability!: string;

  @ApiProperty({
    description: 'Detailed assessment of individual skills',
    type: [SkillDetailsDto],
  })
  @IsNotEmpty()
  skills!: SkillDetailsDto[];

  @ApiProperty({
    description: 'Summary of skill assessments',
    type: SkillsSummaryDto,
  })
  @IsNotEmpty()
  summary!: SkillsSummaryDto;
  metrics: any;
}
