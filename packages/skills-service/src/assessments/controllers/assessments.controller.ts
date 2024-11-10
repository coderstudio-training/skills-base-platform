import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, Roles, RolesGuard, UserRole } from '@skills-base/shared';
import {
  BaseAssessmentDto,
  BulkUpdateAssessmentsDto,
} from '../dto/assessments.dto';
import { AssessmentsService } from '../services/assessments.service';

@Controller('api/skills-assessments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssessmentsController {
  constructor(private readonly assessmentService: AssessmentsService) {}

  @Post('bulk-update-assessments')
  @Roles(UserRole.ADMIN)
  async bulkUpdate(
    @Body()
    body: {
      assessmentType: string;
      data: BaseAssessmentDto[];
      prefix: string;
    },
  ) {
    const { assessmentType, data, prefix } = body; // Make sure to include prefix here
    console.log('Incoming body:', body);

    const bulkUpdateDto: BulkUpdateAssessmentsDto = { data };

    return this.assessmentService.bulkUpsert(
      prefix,
      assessmentType,
      bulkUpdateDto,
    );
  }
}
