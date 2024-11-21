// packages/skills-service/src/assessments/dto/distribution.dto.ts
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export enum SkillStatus {
  WARNING = 'warning',
  CRITICAL = 'critical',
  NORMAL = 'normal',
}

export class SkillDistributionItemDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @IsNotEmpty()
  userCount!: number;

  @IsEnum(SkillStatus)
  status!: SkillStatus;
}

export class SkillDistributionCategoryDto {
  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillDistributionItemDto)
  skills!: SkillDistributionItemDto[];
}

export class BusinessUnitDistributionDto {
  @IsString()
  @IsNotEmpty()
  businessUnit!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillDistributionCategoryDto)
  categories!: SkillDistributionCategoryDto[];
}

export class GradeDistributionItemDto {
  @IsString()
  @IsNotEmpty()
  grade!: string;

  @IsNumber()
  @IsNotEmpty()
  userCount!: number;
}

export class DistributionsResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BusinessUnitDistributionDto)
  skillDistribution!: BusinessUnitDistributionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GradeDistributionItemDto)
  gradeDistribution!: GradeDistributionItemDto[];
}
