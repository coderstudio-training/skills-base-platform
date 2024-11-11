// src/required-skills/dto/required-skills.dto.ts
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

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

  @IsObject()
  skillAverages!: Record<string, number>;

  @IsObject()
  skillGaps!: Record<string, number>; // Use Record<string, number> as the Map equivalent
}

export class BulkSkillGapsDto {
  @ValidateNested({ each: true })
  @Type(() => SkillGapsDto)
  data!: SkillGapsDto[];
}
