import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard, UserRole } from '@skills-base/shared';
import { Request } from 'express';
import { BulkRequiredSkillsDto } from '../dto/required-skills.dto';
import { PerformanceService } from '../services/computation.service';

@ApiTags('Skills Assessments')
@ApiBearerAuth('JWT-Admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/skills-assessments')
export class PerformanceController {
  constructor(private readonly assessmentsService: PerformanceService) {}

  @Roles(UserRole.ADMIN)
  @Get('bulk-performance')
  @ApiOperation({
    summary: 'Calculate bulk performance metrics',
    description:
      'Calculate performance metrics for all employees in a specific business unit',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bu: {
          type: 'string',
          description: 'Business unit to calculate performance for',
          example: 'Digital Engineering',
        },
      },
      required: ['bu'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Performance metrics successfully calculated',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User is not authenticated',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Business unit does not exist',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while calculating performance',
  })
  async bulkCalculatePerformance(@Body() body: { bu: string }) {
    try {
      const { bu } = body;
      if (!bu) {
        throw new Error('Business unit (BU) is required.');
      }
      const performance =
        await this.assessmentsService.bulkCalculatePerformance(bu);
      return performance;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new Error(
          'An error occurred while calculating bulk performance.',
        );
      }
    }
  }

  @Get('required-skills')
  @ApiOperation({
    summary: 'Get required skills by capability',
    description: 'Get all required skills for a specific capability',
  })
  @ApiResponse({
    status: 200,
    description: 'Required skills successfully retrieved',
    type: BulkRequiredSkillsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User is not authenticated',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Capability does not exist',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while retrieving skills',
  })
  async getRequiredSkillsByCapability(@Req() req: Request) {
    try {
      const capability = req.query.capability as string;
      if (!capability) {
        throw new Error('Capability is required.');
      }
      const skills =
        await this.assessmentsService.getRequiredSkillsByCapability(capability);
      return skills;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new Error('An error occurred while retrieving required skills.');
      }
    }
  }
}
