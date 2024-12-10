// dto/re-distributions.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export enum DistributionSkillStatus {
  CRITICAL = 'CRITICAL',
  WARNING = 'WARNING',
  NORMAL = 'NORMAL',
}

export class SkillDto {
  @ApiProperty({ description: 'Name of the skill' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Number of users with this skill' })
  @IsNumber()
  userCount!: number;

  @ApiProperty({
    description: 'Status of the skill',
    enum: DistributionSkillStatus,
  })
  @IsEnum(DistributionSkillStatus)
  status!: DistributionSkillStatus;
}

export class CategoryDistributionDto {
  @ApiProperty({ description: 'Skill category' })
  @IsString()
  category!: string;

  @ApiProperty({ type: [SkillDto] })
  skills!: SkillDto[];
}

export class BusinessUnitDistributionDto {
  @ApiProperty({ description: 'Name of business unit' })
  @IsString()
  businessUnit!: string;

  @ApiProperty({ type: [CategoryDistributionDto] })
  categories!: CategoryDistributionDto[];
}

export class GradeDistributionDto {
  @ApiProperty({ description: 'Grade level' })
  @IsString()
  grade!: string;

  @ApiProperty({ description: 'Number of users in this grade' })
  @IsNumber()
  userCount!: number;
}

export class DistributionsResponseDto {
  @ApiProperty({ type: [BusinessUnitDistributionDto] })
  skillDistribution!: BusinessUnitDistributionDto[];

  @ApiProperty({ type: [GradeDistributionDto] })
  gradeDistribution!: GradeDistributionDto[];
}

// dto/rankings.dto.ts
export class EmployeeRankingDto {
  @ApiProperty({ description: 'Employee name' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Ranking position' })
  @IsNumber()
  ranking!: number;

  @ApiProperty({ description: 'Average skill score' })
  @IsNumber()
  score!: number;
}

export class EmployeeRankingsResponseDto {
  @ApiProperty({ type: [EmployeeRankingDto] })
  rankings!: EmployeeRankingDto[];
}
