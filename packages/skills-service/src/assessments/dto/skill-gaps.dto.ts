// skill-gaps.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';
import { BaseAssessmentDto } from './assessments.dto';

export class SkillGapsDto extends BaseAssessmentDto {
  @IsString()
  careerLevelOfResource!: string;
  @ApiProperty({
    description: 'Map of skills and their average scores from all assessments',
    example: {
      problemSolving: 4,
      creativeThinking: 4,
      decisionMaking: 4,
    },
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  @IsObject()
  skillAverages!: Record<string, number>;

  @ApiProperty({
    description: 'Map of skills and their gaps compared to required level',
    example: {
      problemSolving: 0,
      creativeThinking: 1,
      decisionMaking: 0,
    },
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  @IsObject()
  skillGaps!: Record<string, number>;
}

export class BulkUpdateSkillGapsDto {
  @ApiProperty({
    description: 'Array of skill gaps data to be updated in bulk',
    type: [SkillGapsDto],
    isArray: true,
  })
  data!: SkillGapsDto[];
}
