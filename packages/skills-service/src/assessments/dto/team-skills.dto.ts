// dto/team-skills.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNumber, IsString } from 'class-validator';
import { SkillDetailsDto } from './re-skills-matrix.dto';

export class TeamMemberMetricsDto {
  @ApiProperty({ example: 4.2 })
  @IsNumber()
  softSkillsAverage: number = 0;

  @ApiProperty({ example: 3.8 })
  @IsNumber()
  technicalSkillsAverage: number = 0;

  @ApiProperty({ example: 15 })
  @IsNumber()
  totalSkillsAssessed: number = 0;
}

export class TeamMemberSkillsDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Professional II' })
  @IsString()
  careerLevel!: string;

  @ApiProperty({ example: 'QA' })
  @IsString()
  capability!: string;

  @ApiProperty({ type: [SkillDetailsDto] })
  @Type(() => SkillDetailsDto)
  skills: SkillDetailsDto[] = [];

  // @ApiProperty({ type: TeamMemberMetricsDto })
  // @IsObject()
  // metrics: TeamMemberMetricsDto = new TeamMemberMetricsDto();
}

export class TeamSkillsResponseDto {
  @ApiProperty({ type: [TeamMemberSkillsDto] })
  @Type(() => TeamMemberSkillsDto)
  members: TeamMemberSkillsDto[] = [];
}
