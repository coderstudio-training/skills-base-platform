import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Name of the skill',
    example: 'JavaScript',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Number of users with this skill',
    example: 42,
    type: 'number',
  })
  @IsNumber()
  @IsNotEmpty()
  userCount!: number;

  @ApiProperty({
    description: 'Current status of the skill distribution',
    enum: SkillStatus,
    example: SkillStatus.NORMAL,
    enumName: 'SkillStatus',
  })
  @IsEnum(SkillStatus)
  status!: SkillStatus;
}

export class SkillDistributionCategoryDto {
  @ApiProperty({
    description: 'Name of the skill category',
    example: 'Technical Skills',
  })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiProperty({
    description: 'List of skills and their distribution in this category',
    type: [SkillDistributionItemDto],
    example: [
      {
        name: 'JavaScript',
        userCount: 42,
        status: SkillStatus.NORMAL,
      },
      {
        name: 'Python',
        userCount: 15,
        status: SkillStatus.WARNING,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillDistributionItemDto)
  skills!: SkillDistributionItemDto[];
}

export class BusinessUnitDistributionDto {
  @ApiProperty({
    description: 'Name of the business unit',
    example: 'Engineering',
  })
  @IsString()
  @IsNotEmpty()
  businessUnit!: string;

  @ApiProperty({
    description: 'Skill distribution categories within this business unit',
    type: [SkillDistributionCategoryDto],
    example: [
      {
        category: 'Technical Skills',
        skills: [
          {
            name: 'JavaScript',
            userCount: 42,
            status: SkillStatus.NORMAL,
          },
          {
            name: 'Python',
            userCount: 15,
            status: SkillStatus.WARNING,
          },
        ],
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillDistributionCategoryDto)
  categories!: SkillDistributionCategoryDto[];
}

export class GradeDistributionItemDto {
  @ApiProperty({
    description: 'Career grade or level',
    example: 'Senior Developer',
  })
  @IsString()
  @IsNotEmpty()
  grade!: string;

  @ApiProperty({
    description: 'Number of users at this grade',
    example: 25,
    type: 'number',
  })
  @IsNumber()
  @IsNotEmpty()
  userCount!: number;
}

export class DistributionsResponseDto {
  @ApiProperty({
    description: 'Skill distribution across business units',
    type: [BusinessUnitDistributionDto],
    example: [
      {
        businessUnit: 'Engineering',
        categories: [
          {
            category: 'Technical Skills',
            skills: [
              {
                name: 'JavaScript',
                userCount: 42,
                status: SkillStatus.NORMAL,
              },
            ],
          },
        ],
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BusinessUnitDistributionDto)
  skillDistribution!: BusinessUnitDistributionDto[];

  @ApiProperty({
    description: 'Distribution of users across different grades',
    type: [GradeDistributionItemDto],
    example: [
      {
        grade: 'Senior Developer',
        userCount: 25,
      },
      {
        grade: 'Lead Developer',
        userCount: 10,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GradeDistributionItemDto)
  gradeDistribution!: GradeDistributionItemDto[];
}
