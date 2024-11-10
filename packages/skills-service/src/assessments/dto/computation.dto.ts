import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

// src/performance/dtos/performance-average.dto.ts
export class PerformanceAverageDto {
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
