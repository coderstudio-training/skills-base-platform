// dto/organization-skills.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class SkillPrevalenceDto {
  @ApiProperty({
    description: 'Name of the skill',
    example: 'Test Planning',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Skill prevalence as percentage of maximum rating',
    example: 76.4,
  })
  @IsNumber()
  prevalence!: number;
}

export class SkillGapDto {
  @ApiProperty({
    description: 'Name of the skill',
    example: 'Process Improvement And Optimization',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Current average rating across all employees',
    example: 3.16,
  })
  @IsNumber()
  currentAvg!: number;

  @ApiProperty({
    description: 'Required skill level',
    example: 4,
  })
  @IsNumber()
  requiredLevel!: number;

  @ApiProperty({
    description: 'Gap between required and current level',
    example: 0.84,
  })
  @IsNumber()
  gap!: number;
}

export class CapabilitySkillsAnalysisDto {
  @ApiProperty({
    description: 'Business unit/capability name',
    example: 'QA',
  })
  @IsString()
  capability!: string;

  @ApiProperty({
    description: 'Top skills by prevalence',
    type: [SkillPrevalenceDto],
  })
  topSkills!: SkillPrevalenceDto[];

  @ApiProperty({
    description: 'Top skill gaps',
    type: [SkillGapDto],
  })
  skillGaps!: SkillGapDto[];
}

export class OrganizationSkillsAnalysisDto {
  @ApiProperty({
    description: 'Analysis per capability',
    type: [CapabilitySkillsAnalysisDto],
  })
  capabilities!: CapabilitySkillsAnalysisDto[];
}
