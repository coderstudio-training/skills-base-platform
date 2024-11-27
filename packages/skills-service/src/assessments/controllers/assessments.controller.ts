import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard, UserRole } from '@skills-base/shared';
import {
  BaseAssessmentDto,
  BulkUpdateAssessmentsDto,
} from '../dto/assessments.dto';
import { AssessmentsService } from '../services/assessments.service';

export class BulkUpdateRequestDto {
  @ApiProperty({
    description: 'Type of assessment being updated',
    example: 'self',
    enum: ['self', 'manager'],
  })
  assessmentType!: string;

  @ApiProperty({
    description: 'Array of assessment data to be updated',
    type: [BaseAssessmentDto],
  })
  data!: BaseAssessmentDto[];
}

@ApiTags('Skills Assessments')
@ApiBearerAuth()
@Controller('api/skills-assessments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssessmentsController {
  constructor(private readonly assessmentService: AssessmentsService) {}

  @Post('bulk-update-assessments')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Bulk update skills assessments',
    description:
      'Update multiple skills assessments in a single operation. Requires admin privileges.',
  })
  @ApiBody({
    type: BulkUpdateRequestDto,
    description: 'Bulk update request containing assessment type and data',
  })
  @ApiResponse({
    status: 201,
    description: 'Assessments successfully updated',
    type: BulkUpdateAssessmentsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User is not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not an admin',
  })
  async bulkUpdate(
    @Body()
    body: BulkUpdateRequestDto,
  ) {
    const { assessmentType, data } = body;
    console.log('Incoming body:', body);

    const bulkUpdateDto: BulkUpdateAssessmentsDto = { data };

    return this.assessmentService.bulkUpsert(assessmentType, bulkUpdateDto);
  }
}
