import {
  Body,
  Controller,
  Get,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard, UserRole } from '@skills-base/shared';
import { PerformanceService } from '../services/computation.service';

export class BulkPerformanceRequestDto {
  @ApiProperty({
    description: 'Business unit to calculate performance for',
    example: 'Digital Engineering',
    required: true,
  })
  bu!: string;
}

@ApiTags('Skills Assessments')
@ApiBearerAuth()
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
    type: BulkPerformanceRequestDto,
    description: 'Business unit for performance calculation',
  })
  @ApiResponse({
    status: 200,
    description: 'Performance metrics successfully calculated',
    // Assuming you have a response DTO, you should add it here
    // type: PerformanceResponseDto
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
  async bulkCalculatePerformance(@Body() body: BulkPerformanceRequestDto) {
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
}
