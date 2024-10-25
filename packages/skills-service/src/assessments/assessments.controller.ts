// assessments.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { SkillsService } from './assessments.service';
import { BaseSkillsDto } from './dto/assessments.dto';

@Controller('api/skills-matrix')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post('bulk-update')
  async bulkUpdate(@Body() body: { assessmentType: string; data: BaseSkillsDto[] }) {
    const { assessmentType, data } = body;

    // Log the incoming request body
    console.log('Incoming body:', body);

    // Pass the assessmentType and data to the service for processing
    return this.skillsService.bulkUpsert(assessmentType, { data });
  }
}
