// src/required-skills/dto/required-skills.dto.ts
import { BaseDto } from '@skills-base/shared';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class RequiredSkillsDto extends BaseDto {
  @IsString()
  @IsNotEmpty()
  capability!: string;

  @IsString()
  @IsNotEmpty()
  careerLevel!: string;

  // Use IsObject instead of IsMap for class-validator
  @IsObject()
  @Type(() => Object)
  requiredSkills!: Record<string, number>; // Use Record<string, number> as the Map equivalent
}

export class BulkRequiredSkillsDto {
  @IsNotEmpty()
  @IsArray()
  @Type(() => RequiredSkillsDto)
  data!: RequiredSkillsDto[];
}
