import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class SkillGapsDto {
  @ApiProperty({
    description: 'Email address of the employee',
    example: 'john.doe@company.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  emailAddress!: string;

  @ApiProperty({
    description: 'Full name of the employee',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  nameOfResource!: string;

  @ApiProperty({
    description: 'Current career level of the employee',
    example: 'Senior Developer',
  })
  @IsString()
  @IsNotEmpty()
  careerLevel!: string;

  @ApiProperty({
    description: 'Business unit to which the employee belongs',
    example: 'Digital Engineering',
  })
  @IsString()
  @IsNotEmpty()
  capability!: string;

  @ApiProperty({
    description: 'Map of skills and their average assessment scores',
    example: {
      JavaScript: 4.2,
      TypeScript: 3.8,
      'Node.js': 4.0,
    },
    type: 'object',
    additionalProperties: {
      type: 'number',
      description: 'Skill assessment score',
    },
  })
  @IsObject()
  skillAverages!: Record<string, number>;

  @ApiProperty({
    description: 'Map of skills and their gaps compared to required levels',
    example: {
      JavaScript: -0.8, // Negative indicates below required level
      TypeScript: 0.2, // Positive indicates above required level
      'Node.js': 0, // Zero indicates meeting required level
    },
    type: 'object',
    additionalProperties: {
      type: 'number',
      description: 'Skill gap value',
    },
  })
  @IsObject()
  skillGaps!: Record<string, number>;
}

export class SkillsDto {
  @ApiPropertyOptional({
    description: 'Map of skills and their assessment scores',
    example: {
      JavaScript: 4,
      TypeScript: 3,
      'Node.js': 4,
    },
    type: 'object',
    additionalProperties: {
      type: 'number',
      description: 'Skill assessment score',
      minimum: 1,
      maximum: 5,
    },
  })
  @IsObject()
  skills?: Record<string, number>;
}
export class AssessmentsDto {
  @ApiPropertyOptional({
    description: 'Self-assessment scores',
    type: SkillsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SkillsDto)
  selfSkills?: SkillsDto;

  @ApiPropertyOptional({
    description: 'Manager assessment scores',
    type: SkillsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SkillsDto)
  managerSkills?: SkillsDto;
}

export class EmployeeSkillsResponseDto {
  @ApiProperty({
    description: 'Staff member skills and gaps information',
    type: SkillGapsDto,
  })
  @ValidateNested()
  @Type(() => SkillGapsDto)
  staff!: SkillGapsDto;

  @ApiPropertyOptional({
    description: 'Combined self and manager assessments',
    type: AssessmentsDto,
  })
  @ValidateNested()
  @Type(() => AssessmentsDto)
  assessments?: AssessmentsDto;
}

export enum SkillCategory {
  TECHNICAL = 'Technical Skills',
  SOFT = 'Soft Skills',
}

export class TransformedSkillDto {
  @ApiProperty({
    description: 'Name of the skill',
    example: 'JavaScript',
  })
  @IsString()
  @IsNotEmpty()
  skill!: string;

  @ApiProperty({
    description: 'Category of the skill',
    enum: SkillCategory,
    example: SkillCategory.TECHNICAL,
    enumName: 'SkillCategory',
  })
  @IsEnum(SkillCategory)
  category!: SkillCategory;

  @ApiProperty({
    description: 'Self-assessment rating',
    minimum: 1,
    maximum: 5,
    example: 4,
    type: 'number',
  })
  @IsNumber()
  selfRating!: number;

  @ApiProperty({
    description: 'Manager assessment rating',
    minimum: 1,
    maximum: 5,
    example: 4,
    type: 'number',
  })
  @IsNumber()
  managerRating!: number;

  @ApiProperty({
    description: 'Required skill level for the role',
    minimum: 1,
    maximum: 5,
    example: 4,
    type: 'number',
  })
  @IsNumber()
  requiredRating!: number;

  @ApiProperty({
    description: 'Gap between current and required skill level',
    example: -0.5,
    type: 'number',
  })
  @IsNumber()
  gap!: number;

  @ApiProperty({
    description: 'Average rating across all assessments',
    example: 4.2,
    type: 'number',
  })
  @IsNumber()
  average!: number;
}

export class TransformedSkillsResponseDto {
  @ApiProperty({
    description: 'Array of transformed skill assessments',
    type: [TransformedSkillDto],
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransformedSkillDto)
  skills!: TransformedSkillDto[];
}

export class EmployeeRankingDto {
  @ApiProperty({
    description: 'Name of the employee',
    example: 'John Doe',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Ranking position',
    example: 1,
    type: 'number',
  })
  @IsNumber()
  ranking!: number;

  @ApiProperty({
    description: 'Overall score',
    example: 4.5,
    type: 'number',
  })
  @IsNumber()
  score!: number;
}

export class EmployeeRankingsResponseDto {
  @ApiProperty({
    description: 'Array of employee rankings',
    type: [EmployeeRankingDto],
    example: [
      {
        name: 'John Doe',
        ranking: 1,
        score: 4.5,
      },
      {
        name: 'Jane Smith',
        ranking: 2,
        score: 4.2,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmployeeRankingDto)
  rankings!: EmployeeRankingDto[];
}
