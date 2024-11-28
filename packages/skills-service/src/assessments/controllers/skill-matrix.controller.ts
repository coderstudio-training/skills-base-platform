import { Controller, Get, HttpStatus, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard, UserRole } from '@skills-base/shared';
import { AdminSkillAnalyticsDto } from '../dto/computation.dto';
import { DistributionsResponseDto } from '../dto/distributions.dto';
import { EmployeeRankingsResponseDto } from '../dto/user-skills.dto';
import { SkillsMatrixService } from '../services/skills-matrix.service';

@ApiTags('Skill Matrix')
@ApiBearerAuth('JWT-auth')
@Controller('api/skills')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SkillMatrixController {
  constructor(private readonly skillMatrixService: SkillsMatrixService) {}

  @Get('skills-matrix')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @ApiOperation({
    summary: 'Get skills matrix for all employees',
    description:
      'Retrieve a comprehensive matrix of skills for all employees in the organization.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved skills matrix for all employees',
    // Add type once you have a response DTO
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have sufficient permissions',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not authenticated',
  })
  async getAllEmployeesSkillsMatrix() {
    return this.skillMatrixService.getAllEmployeesSkillsData();
  }

  @Get('analytics')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Get organization-wide skill analytics',
    description:
      'Retrieve analytics about skills across the organization, including top skills and skill gaps.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved skill analytics',
    type: AdminSkillAnalyticsDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'User does not have sufficient permissions. Required roles: ADMIN, MANAGER',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not authenticated',
  })
  async getOrganizationAnalytics(): Promise<AdminSkillAnalyticsDto> {
    return this.skillMatrixService.getAdminSkillsAnalytics();
  }

  @Get('distributions')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get skill distributions',
    description:
      'Retrieve distributions of skills across business units and grade levels. Admin only.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved skill distributions',
    type: DistributionsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have admin privileges',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not authenticated',
  })
  async getDistributions(): Promise<DistributionsResponseDto> {
    return this.skillMatrixService.getDistributions();
  }

  @Get('employee/:email')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Get skills for a specific employee',
    description:
      'Retrieve detailed skill information for a specific employee by their email.',
  })
  @ApiParam({
    name: 'email',
    required: true,
    description: 'Email address of the employee',
    example: 'john.doe@company.com',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved employee skills',
    // Add type once you have a response DTO
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Employee not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'User does not have sufficient permissions. Required roles: ADMIN, MANAGER',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not authenticated',
  })
  async getEmployeeSkills(@Param('email') email: string) {
    return this.skillMatrixService.getEmployeeSkillsByEmail(email);
  }

  @Get('rankings')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Get employee skill rankings',
    description:
      'Retrieve rankings of employees based on their skill assessments.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved employee rankings',
    type: EmployeeRankingsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'User does not have sufficient permissions. Required roles: ADMIN, MANAGER',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not authenticated',
  })
  async getEmployeeRankings(): Promise<EmployeeRankingsResponseDto> {
    return this.skillMatrixService.getEmployeeRankings();
  }
}
