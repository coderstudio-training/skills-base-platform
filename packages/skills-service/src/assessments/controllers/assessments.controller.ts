import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  InvalidateCache,
  JwtAuthGuard,
  Permission,
  RequirePermissions,
  Roles,
  RolesGuard,
  UserRole,
} from '@skills-base/shared';
import {
  BaseAssessmentDto,
  BulkUpdateAssessmentsDto,
  SkillGapsDto,
} from '../dto/assessments.dto';
import { AssessmentsService } from '../services/assessments.service';

@ApiTags('Skills Assessments')
@ApiBearerAuth('JWT-Admin')
@Controller('api/skills-assessments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssessmentsController {
  constructor(private readonly assessmentService: AssessmentsService) {}

  @Post('bulk-update-assessments')
  @Roles(UserRole.ADMIN)
  @RequirePermissions(Permission.EDIT_ALL_SKILLS)
  @ApiOperation({
    summary: 'Bulk update skills assessments',
    description:
      'Update multiple skills assessments in a single operation. Requires admin privileges.',
  })
  @ApiBody({
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
  @InvalidateCache(['assessments', 'assessments:*'])
  async bulkUpdate(
    @Body()
    body: {
      assessmentType: string;
      data: BaseAssessmentDto[] | SkillGapsDto[];
    },
  ) {
    const { assessmentType, data } = body;
    console.log('Incoming body:', body);

    if (assessmentType === 'gap') {
      return this.assessmentService.bulkUpsert(assessmentType, {
        data: data as SkillGapsDto[],
      });
    }

    return this.assessmentService.bulkUpsert(assessmentType, {
      data: data as BaseAssessmentDto[],
    });
  }
}
