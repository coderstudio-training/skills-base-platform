import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

export class SelfSkillsDto {
  @IsString()
  @IsNotEmpty()
  email!: string; // Definite assignment assertion

  @IsString()
  @IsNotEmpty()
  timestamp!: string; // Definite assignment assertion

  @IsString()
  @IsNotEmpty()
  resourceName!: string; // Definite assignment assertion

  @IsString()
  @IsNotEmpty()
  capability!: string; // Definite assignment assertion

  @IsString()
  @IsNotEmpty()
  careerLevel!: string; // Definite assignment assertion

  @IsObject()
  skills!: Record<string, number>; // Directly accepts skill names mapped to skill levels
}

export class BulkUpdateSelfSkillsDto {
  @ValidateNested({ each: true })
  @Type(() => SelfSkillsDto)
  data!: SelfSkillsDto[]; // Definite assignment assertion
}
