import { BaseDto } from '@skills-base/shared';
import { IsEnum, IsNumber, IsString, Max, Min } from 'class-validator';
// import { CareerLevel } from '../career-level.enum';

enum CareerLevel {
  PROFESSIONAL_II = 'Professional II',
  PROFESSIONAL_III = 'Professional III',
  PROFESSIONAL_IV = 'Professional IV',
  MANAGER_I = 'Manager I',
  MANAGER_II = 'Manager II',
  DIRECTOR_I = 'Director I',
  DIRECTOR_II = 'Director II',
  DIRECTOR_III = 'Director III',
  DIRECTOR_IV = 'Director IV',
}

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
