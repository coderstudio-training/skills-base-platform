import { BaseDto } from '@skills-base/shared';
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

// src/performance/dtos/performance-average.dto.ts
export class PerformanceAverageDto extends BaseDto {
  @IsEmail()
  @IsNotEmpty()
  emailAddress!: string;

  @IsString()
  @IsNotEmpty()
  nameOfResource!: string;

  @IsString()
  @IsNotEmpty()
  careerLevelOfResource!: string;

  @IsString()
  @IsNotEmpty()
  capability!: string;

  @IsOptional()
  @IsDate()
  lastUpdated?: Date;

  @IsObject()
  skills!: {
    [key: string]: number; // average score for each skill
  };
}

export class TopSkillDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  prevalence!: number;
}

export class SkillGapDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @Min(0)
  @Max(5)
  currentLevel!: number;

  @IsNumber()
  @Min(0)
  @Max(5)
  requiredLevel!: number;

  @IsNumber()
  @Min(0)
  @Max(5)
  gap!: number;
}

export class AdminSkillAnalyticsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  topSkills!: TopSkillDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  skillGaps!: SkillGapDto[];
}
