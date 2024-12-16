import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDto } from '@skills-base/shared';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class PerformanceAverageDto extends BaseDto {
  @ApiProperty({
    description: 'Email address of the resource',
    example: 'john.doe@company.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  emailAddress!: string;

  @ApiProperty({
    description: 'Full name of the resource',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  nameOfResource!: string;

  @ApiProperty({
    description: 'Career level of the resource',
    example: 'Senior Developer',
  })
  @IsString()
  @IsNotEmpty()
  careerLevelOfResource!: string;

  @ApiProperty({
    description: 'Capability category being assessed',
    example: 'Technical Skills',
  })
  @IsString()
  @IsNotEmpty()
  capability!: string;

  @ApiPropertyOptional({
    description: 'Timestamp of last update',
    type: Date,
    example: '2024-03-27T10:00:00Z',
  })
  @IsOptional()
  @IsDate()
  lastUpdated?: Date;

  @ApiProperty({
    description: 'Map of skills and their average scores',
    example: {
      JavaScript: 4.2,
      TypeScript: 3.8,
      'Node.js': 4.0,
    },
    type: 'object',
    additionalProperties: {
      type: 'number',
      description: 'Average score for the skill',
    },
  })
  @IsObject()
  skills!: {
    [key: string]: number;
  };
}

export enum DistributionSkillStatus {
  CRITICAL = 'CRITICAL',
  WARNING = 'WARNING',
  NORMAL = 'NORMAL',
}

export class SkillDto {
  @ApiProperty({ description: 'Name of the skill' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Number of users with this skill' })
  @IsNumber()
  userCount!: number;

  @ApiProperty({
    description: 'Status of the skill',
    enum: DistributionSkillStatus,
  })
  @IsEnum(DistributionSkillStatus)
  status!: DistributionSkillStatus;
}

export class CategoryDistributionDto {
  @ApiProperty({ description: 'Skill category' })
  @IsString()
  category!: string;

  @ApiProperty({ type: [SkillDto] })
  skills!: SkillDto[];
}

export class BusinessUnitDistributionDto {
  @ApiProperty({ description: 'Name of business unit' })
  @IsString()
  businessUnit!: string;

  @ApiProperty({ type: [CategoryDistributionDto] })
  categories!: CategoryDistributionDto[];
}

export class GradeDistributionDto {
  @ApiProperty({ description: 'Grade level' })
  @IsString()
  grade!: string;

  @ApiProperty({ description: 'Number of users in this grade' })
  @IsNumber()
  userCount!: number;
}

export class DistributionsResponseDto {
  @ApiProperty({ type: [BusinessUnitDistributionDto] })
  skillDistribution!: BusinessUnitDistributionDto[];

  @ApiProperty({ type: [GradeDistributionDto] })
  gradeDistribution!: GradeDistributionDto[];
}

export class EmployeeRankingDto {
  @ApiProperty({ description: 'Employee name' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Ranking position' })
  @IsNumber()
  ranking!: number;

  @ApiProperty({ description: 'Average skill score' })
  @IsNumber()
  score!: number;
}

export class EmployeeRankingsResponseDto {
  @ApiProperty({ type: [EmployeeRankingDto] })
  rankings!: EmployeeRankingDto[];
}

export class SkillPrevalenceDto {
  @ApiProperty({
    description: 'Name of the skill',
    example: 'Test Planning',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Skill prevalence as percentage of maximum rating',
    example: 76.4,
  })
  @IsNumber()
  prevalence!: number;
}

export class SkillGapDto {
  @ApiProperty({
    description: 'Name of the skill',
    example: 'Process Improvement And Optimization',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Current average rating across all employees',
    example: 3.16,
  })
  @IsNumber()
  currentAvg!: number;

  @ApiProperty({
    description: 'Required skill level',
    example: 4,
  })
  @IsNumber()
  requiredLevel!: number;

  @ApiProperty({
    description: 'Gap between required and current level',
    example: 0.84,
  })
  @IsNumber()
  gap!: number;
}

export class CapabilitySkillsAnalysisDto {
  @ApiProperty({
    description: 'Business unit/capability name',
    example: 'QA',
  })
  @IsString()
  capability!: string;

  // @ApiProperty({
  //   description: 'Top skills by prevalence',
  //   type: [SkillPrevalenceDto],
  // })
  // topSkills!: SkillPrevalenceDto[];

  @ApiProperty({
    description: 'Top skill gaps',
    type: [SkillGapDto],
  })
  skillGaps!: SkillGapDto[];
}

export class OrganizationSkillsAnalysisDto {
  @ApiProperty({
    description: 'Analysis per capability',
    type: [CapabilitySkillsAnalysisDto],
  })
  capabilities!: CapabilitySkillsAnalysisDto[];
}
