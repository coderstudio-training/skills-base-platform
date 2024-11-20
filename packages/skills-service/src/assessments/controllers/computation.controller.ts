import {
  Body,
  Controller,
  Get,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '@skills-base/shared';
import { PerformanceService } from '../services/computation.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/skills-assessments')
export class PerformanceController {
  constructor(private readonly assessmentsService: PerformanceService) {}

  @UseGuards(JwtAuthGuard)
  @Get('bulk-performance')
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
}
