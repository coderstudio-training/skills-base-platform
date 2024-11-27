import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDto } from '@skills-base/shared';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class BaseAssessmentDto extends BaseDto {
  @ApiProperty({
    description: 'Timestamp when the assessment was created',
    type: Date,
    example: '2024-03-27T10:00:00Z',
  })
  @IsNotEmpty()
  timestamp!: Date;

  @ApiProperty({
    description: 'Email address of the person being assessed',
    example: 'john.doe@company.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  emailAddress!: string;

  @ApiProperty({
    description: 'Full name of the resource being assessed',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  nameOfResource!: string;

  @ApiPropertyOptional({
    description: 'Email of the resource being assessed (optional)',
    example: 'john.doe@company.com',
    format: 'email',
  })
  @IsOptional()
  @IsEmail()
  emailOfResource?: string;

  @ApiProperty({
    description: 'Career level of the resource being assessed',
    example: 'Senior Developer',
  })
  @IsString()
  @IsNotEmpty()
  careerLevelOfResource!: string;

  @ApiProperty({
    description: 'Name of the person conducting the assessment',
    example: 'Jane Smith',
  })
  @IsString()
  @IsNotEmpty()
  nameOfRespondent!: string;

  @ApiProperty({
    description: 'Capability category being assessed',
    example: 'Technical Skills',
  })
  @IsString()
  @IsNotEmpty()
  capability!: string;

  @ApiProperty({
    description: 'Map of skills and their assessment scores',
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
      description: 'Skill proficiency level (1-5 scale)',
    },
  })
  @IsObject()
  skills!: Record<string, number>;
}

export class BulkUpdateAssessmentsDto {
  @ApiProperty({
    description: 'Array of assessment data to be updated in bulk',
    type: [BaseAssessmentDto],
    isArray: true,
    example: [
      {
        timestamp: '2024-03-27T10:00:00Z',
        emailAddress: 'john.doe@company.com',
        nameOfResource: 'John Doe',
        careerLevelOfResource: 'Senior Developer',
        nameOfRespondent: 'Jane Smith',
        capability: 'Technical Skills',
        skills: {
          JavaScript: 4,
          TypeScript: 4,
          'Node.js': 3,
        },
      },
    ],
  })
  @ValidateNested({ each: true })
  @Type(() => BaseAssessmentDto)
  data!: BaseAssessmentDto[];
}
