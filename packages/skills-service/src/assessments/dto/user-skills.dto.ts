import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

// For the staff/gap assessment data
export class SkillGapsDto {
  @IsEmail()
  @IsNotEmpty()
  emailAddress!: string;

  @IsString()
  @IsNotEmpty()
  nameOfResource!: string;

  @IsString()
  @IsNotEmpty()
  careerLevel!: string;

  @IsString()
  @IsNotEmpty()
  capability!: string;

  @IsObject()
  skillAverages!: Record<string, number>;

  @IsObject()
  skillGaps!: Record<string, number>;
}

// For the skills assessment data
export class SkillsDto {
  @IsObject()
  skills?: Record<string, number>;
}

// For combining self and manager assessments
export class AssessmentsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => SkillsDto)
  selfSkills?: SkillsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SkillsDto)
  managerSkills?: SkillsDto;
}

// Main response DTO
export class EmployeeSkillsResponseDto {
  @ValidateNested()
  @Type(() => SkillGapsDto)
  staff!: SkillGapsDto;

  @ValidateNested()
  @Type(() => AssessmentsDto)
  assessments?: AssessmentsDto;
}

export enum SkillCategory {
  TECHNICAL = 'Technical Skills',
  SOFT = 'Soft Skills',
}

export class TransformedSkillDto {
  @IsString()
  @IsNotEmpty()
  skill!: string;

  @IsEnum(SkillCategory)
  category!: SkillCategory;

  @IsNumber()
  selfRating!: number;

  @IsNumber()
  managerRating!: number;

  @IsNumber()
  requiredRating!: number;

  @IsNumber()
  gap!: number;

  @IsNumber()
  average!: number;
}

export class TransformedSkillsResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransformedSkillDto)
  skills!: TransformedSkillDto[];
}
