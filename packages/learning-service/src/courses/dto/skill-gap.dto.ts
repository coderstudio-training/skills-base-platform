import { BaseDto } from '@skills-base/shared';
import { IsEnum, IsNumber, IsString, Max, Min } from 'class-validator';
import { CareerLevel } from '../career-level.enum';

export class SkillGapDto extends BaseDto {
  @IsString()
  skillName!: string;

  @IsNumber()
  @Min(0)
  @Max(5)
  currentLevel!: number;

  @IsNumber()
  @Min(1)
  @Max(6)
  requiredLevel!: number;

  @IsEnum(CareerLevel)
  careerLevel!: string;
}
