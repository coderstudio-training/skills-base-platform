import { Body, Controller, Post } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { BaseAssessmentDto, BulkUpdateAssessmentsDto } from './dto/assessments.dto';

@Controller('api/skills-matrix')
export class AssessmentsController {
  constructor(private readonly assessmentService: AssessmentsService) {}

  @Post('bulk-update-assessments')
  async bulkUpdate(@Body() body: { assessmentType: string; data: BaseAssessmentDto[]; prefix: string; }) {
    const { assessmentType, data, prefix } = body; // Make sure to include prefix here
    console.log('Incoming body:', body);

    // Construct the BulkUpdateAssessmentsDto
    const bulkUpdateDto: BulkUpdateAssessmentsDto = { data }; 

    return this.assessmentService.bulkUpsert(prefix, assessmentType, bulkUpdateDto); // Call the service with the correct parameters
  }

  // Uncomment and implement this method if needed
  // @Get(':assessmentType')
  // async getAll(@Param('assessmentType') assessmentType: string) {
  //   return await this.skillsService.getAllRecords(assessmentType);
  // }
}
