import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Name of the skill being assessed',
    example: 'Software Testing',
  })
  @IsString()
  skillName!: string;

  @ApiProperty({
    description: 'Current skill level of the employee',
    minimum: 0,
    maximum: 5,
    example: 2.5,
  })
  @IsNumber()
  @Min(0)
  @Max(5)
  currentLevel!: number;

  @ApiProperty({
    description: 'Required skill level for the career level',
    minimum: 1,
    maximum: 6,
    example: 3,
  })
  @IsNumber()
  @Min(1)
  @Max(6)
  requiredLevel!: number;

  @ApiProperty({
    description: 'Career level of the employee',
    enum: CareerLevel,
    example: CareerLevel.PROFESSIONAL_III,
    enumName: 'CareerLevel',
  })
  @IsEnum(CareerLevel)
  careerLevel!: string;
}
