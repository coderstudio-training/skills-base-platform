import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

// For the user/gap assessment data
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
  skills!: Record<string, number>;
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
  user!: SkillGapsDto;

  @ValidateNested()
  @Type(() => AssessmentsDto)
  assessments?: AssessmentsDto;
}
