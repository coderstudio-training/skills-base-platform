import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDto } from '@skills-base/shared';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
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

export class TopSkillDto {
  @ApiProperty({
    description: 'Name of the skill',
    example: 'JavaScript',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Prevalence of the skill across the organization (percentage)',
    minimum: 0,
    maximum: 100,
    example: 85,
    type: 'number',
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  prevalence!: number;
}

export class SkillGapDto {
  @ApiProperty({
    description: 'Name of the skill',
    example: 'JavaScript',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Current average skill level',
    minimum: 0,
    maximum: 5,
    example: 3.5,
    type: 'number',
  })
  @IsNumber()
  @Min(0)
  @Max(5)
  currentLevel!: number;

  @ApiProperty({
    description: 'Required skill level for the role',
    minimum: 0,
    maximum: 5,
    example: 4,
    type: 'number',
  })
  @IsNumber()
  @Min(0)
  @Max(5)
  requiredLevel!: number;

  @ApiProperty({
    description:
      'Gap between required and current level (positive indicates deficit)',
    minimum: 0,
    maximum: 5,
    example: 0.5,
    type: 'number',
  })
  @IsNumber()
  @Min(0)
  @Max(5)
  gap!: number;
}

export class AdminSkillAnalyticsDto {
  @ApiProperty({
    description: 'List of top skills across the organization',
    type: [TopSkillDto],
    example: [
      {
        name: 'JavaScript',
        prevalence: 85,
      },
      {
        name: 'TypeScript',
        prevalence: 75,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopSkillDto)
  @ArrayMinSize(1)
  topSkills!: TopSkillDto[];

  @ApiProperty({
    description: 'List of skill gaps identified across the organization',
    type: [SkillGapDto],
    example: [
      {
        name: 'Cloud Architecture',
        currentLevel: 3.5,
        requiredLevel: 4,
        gap: 0.5,
      },
      {
        name: 'Kubernetes',
        currentLevel: 3,
        requiredLevel: 4,
        gap: 1,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillGapDto)
  @ArrayMinSize(1)
  skillGaps!: SkillGapDto[];
}
