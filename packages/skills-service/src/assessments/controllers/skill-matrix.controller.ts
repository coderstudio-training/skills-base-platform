import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard, UserRole } from '@skills-base/shared';
import { AdminSkillAnalyticsDto } from '../dto/computation.dto';
import { DistributionsResponseDto } from '../dto/distributions.dto';
import { EmployeeRankingsResponseDto } from '../dto/user-skills.dto';
import { SkillsMatrixService } from '../services/skills-matrix.service';

@ApiTags('Skill Matrix')
@Controller('api/skills')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SkillMatrixController {
  constructor(private readonly skillMatrixService: SkillsMatrixService) {}

  @Get('skills-matrix')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @ApiOperation({ summary: 'Get skills matrix for all employees' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved skills matrix for all employees',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have sufficient permissions',
  })
  async getAllEmployeesSkillsMatrix() {
    return this.skillMatrixService.getAllEmployeesSkillsData();
  }

  @Get('analytics')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get organization-wide skill analytics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved skill analytics',
  })
  async getOrganizationAnalytics(): Promise<AdminSkillAnalyticsDto> {
    return this.skillMatrixService.getAdminSkillsAnalytics();
  }

  @Roles(UserRole.ADMIN)
  @Get('distributions')
  async getDistributions(): Promise<DistributionsResponseDto> {
    return this.skillMatrixService.getDistributions();
  }

  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Get('rankings')
  async getEmployeeRankings(): Promise<EmployeeRankingsResponseDto> {
    return this.skillMatrixService.getEmployeeRankings();
  }
}
