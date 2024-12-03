import {
  Controller,
  Get,
  HttpStatus,
  Logger,
  NotFoundException,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard, UserRole } from '@skills-base/shared';
import {
  EmployeeSkillsResponseDto,
  SkillsSummaryDto,
} from '../dto/re-skills-matrix.dto';
import { SkillsMatrixService } from '../services/re-skills-matrix.service';
import { EmailValidationPipe } from '../utils/skills.util';

@ApiTags('Skills Matrix')
@Controller('api/skills-matrix')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class SkillsMatrixController {
  private readonly logger = new Logger(SkillsMatrixController.name);

  constructor(private readonly skillsMatrixService: SkillsMatrixService) {}

  @Get('user')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
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
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
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
}
