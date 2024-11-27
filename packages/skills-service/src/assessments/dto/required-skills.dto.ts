import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDto } from '@skills-base/shared';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class RequiredSkillsDto extends BaseDto {
  @ApiProperty({
    description: 'The capability where skills belong to',
    example: 'Quality Assurance',
  })
  @IsString()
  @IsNotEmpty()
  capability!: string;

  @ApiProperty({
    description: 'Career level for which these skill requirements apply',
    example: 'Senior Developer',
  })
  @IsString()
  @IsNotEmpty()
  careerLevel!: string;

  @ApiPropertyOptional({
    description: 'Map of skills and their required proficiency levels',
    example: {
      JavaScript: 4,
      TypeScript: 4,
      'Node.js': 3,
      React: 4,
      MongoDB: 3,
    },
    type: 'object',
    additionalProperties: {
      type: 'number',
      minimum: 1,
      maximum: 5,
      description: 'Required proficiency level (1-5 scale)',
    },
  })
  @IsObject()
  @IsOptional()
  @Type(() => Object)
  requiredSkills?: Record<string, number>;
}

export class BulkRequiredSkillsDto {
  @ApiProperty({
    description: 'Array of required skills data for bulk operations',
    type: [RequiredSkillsDto],
    example: [
      {
        capability: 'Technical Skills',
        careerLevel: 'Senior Developer',
        requiredSkills: {
          JavaScript: 4,
          TypeScript: 4,
          'Node.js': 3,
        },
      },
      {
        capability: 'Technical Skills',
        careerLevel: 'Lead Developer',
        requiredSkills: {
          JavaScript: 5,
          TypeScript: 5,
          'Node.js': 4,
        },
      },
    ],
  })
  @IsNotEmpty()
  @IsArray()
  @Type(() => RequiredSkillsDto)
  data!: RequiredSkillsDto[];
}
