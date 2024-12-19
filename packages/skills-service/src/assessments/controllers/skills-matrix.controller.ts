import {
  Controller,
  Get,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard, UserRole } from '@skills-base/shared';
import {
  DistributionsResponseDto,
  EmployeeRankingsResponseDto,
  OrganizationSkillsAnalysisDto,
} from '../dto/computation.dto';
import {
  EmployeeSkillsResponseDto,
  SkillsSummaryDto,
  TeamSkillsResponseDto,
} from '../dto/skills-matrix.dto';
import { SkillsMatrixService } from '../services/skills-matrix.service';
import { EmailValidationPipe } from '../utils/skills.util';

@ApiTags('Skills Matrix')
@Controller('skills-matrix')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class SkillsMatrixController {
  private readonly logger = new Logger(SkillsMatrixController.name);

  constructor(private readonly skillsMatrixService: SkillsMatrixService) {}

  @Get('user')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({
    summary: 'Get employee skills assessment',
    description:
      'Retrieves detailed skill assessment information for a specific employee',
  })
  @ApiQuery({
    name: 'email',
    required: true,
    description: 'Email address of the employee',
    example: 'john.doe@company.com',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved employee skills assessment',
    type: EmployeeSkillsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Employee assessment not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid email format',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not authenticated',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have required permissions',
  })
  async getEmployeeSkills(
    @Query('email', new EmailValidationPipe()) email: string,
  ): Promise<EmployeeSkillsResponseDto> {
    this.logger.log(`Received request for employee skills: ${email}`);

    try {
      const skills =
        await this.skillsMatrixService.getEmployeeSkillsByEmail(email);

      if (!skills) {
        const notFoundMsg = `Skills assessment not found for email: ${email}`;
        this.logger.warn(notFoundMsg);
        throw new NotFoundException(notFoundMsg);
      }

      this.logger.log(`Successfully returned skills for employee: ${email}`);
      return skills;
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      if (error instanceof NotFoundException) {
        this.logger.warn(errorMsg);
      } else {
        this.logger.error(
          `Error retrieving skills for ${email}: ${errorMsg}`,
          error instanceof Error ? error.stack : undefined,
        );
      }

      throw error;
    }
  }

  @Get('user/summary')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({
    summary: 'Get employee skills summary',
    description:
      'Retrieves summary statistics of skills assessment for a specific employee',
  })
  @ApiQuery({
    name: 'email',
    required: true,
    description: 'Email address of the employee',
    example: 'john.doe@company.com',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved skills summary',
    type: SkillsSummaryDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Employee assessment not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid email format',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not authenticated',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have required permissions',
  })
  async getEmployeeSkillsSummary(
    @Query('email', new EmailValidationPipe()) email: string,
  ): Promise<SkillsSummaryDto> {
    this.logger.log(`Received request for employee skills summary: ${email}`);

    try {
      const summary =
        await this.skillsMatrixService.getEmployeeSkillsSummary(email);

      if (!summary) {
        const notFoundMsg = `Skills summary not found for email: ${email}`;
        this.logger.warn(notFoundMsg);
        throw new NotFoundException(notFoundMsg);
      }

      this.logger.log(
        `Successfully returned skills summary for employee: ${email}`,
      );
      return summary;
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      if (error instanceof NotFoundException) {
        this.logger.warn(errorMsg);
      } else {
        this.logger.error(
          `Error retrieving skills summary for ${email}: ${errorMsg}`,
          error instanceof Error ? error.stack : undefined,
        );
      }

      throw error;
    }
  }

  @Get('admin/analysis')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Get organization technical skills analysis',
    description: 'Retrieves technical skills analysis grouped by capabilities',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Successfully retrieved organization technical skills analysis',
    type: OrganizationSkillsAnalysisDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not authenticated',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have required permissions',
  })
  async getAdminSkillsAnalysis(): Promise<OrganizationSkillsAnalysisDto> {
    this.logger.log(
      'Received request for organization technical skills analysis',
    );

    try {
      const analysis = await this.skillsMatrixService.getAdminSkillsAnalysis();

      this.logger.log(
        'Successfully returned organization technical skills analysis',
      );
      return analysis;
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      this.logger.error(
        `Error retrieving organization technical skills analysis: ${errorMsg}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw error;
    }
  }

  @Get('distributions')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Get skill distributions',
    description:
      'Retrieves skill distributions across business units and grade levels',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved skill distributions',
    type: DistributionsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not authenticated',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have required permissions',
  })
  async getDistributions(): Promise<DistributionsResponseDto> {
    this.logger.log('Received request for skill distributions');

    try {
      const distributions = await this.skillsMatrixService.getDistributions();

      this.logger.log('Successfully returned skill distributions');
      return distributions;
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      this.logger.error(
        `Error retrieving skill distributions: ${errorMsg}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw error;
    }
  }

  @Get('rankings')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Get employee skill rankings',
    description:
      'Retrieves top performing employees based on skill assessments',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved employee rankings',
    type: EmployeeRankingsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not authenticated',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have required permissions',
  })
  async getEmployeeRankings(): Promise<EmployeeRankingsResponseDto> {
    this.logger.log('Received request for employee rankings');

    try {
      const rankings = await this.skillsMatrixService.getEmployeeRankings();

      this.logger.log('Successfully returned employee rankings');
      return rankings;
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      this.logger.error(
        `Error retrieving employee rankings: ${errorMsg}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw error;
    }
  }

  @Get('manager/:managerName')
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get team members skills by manager name' })
  @ApiParam({
    name: 'managerName',
    description: 'Manager full name',
    example: 'Adrian Oraya',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns skills of all team members under the manager',
    type: TeamSkillsResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getTeamSkills(
    @Param('managerName') managerName: string,
  ): Promise<TeamSkillsResponseDto> {
    return this.skillsMatrixService.getTeamSkills(managerName);
  }
}
