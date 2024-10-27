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
    console.log('Incoming body:', body);
    return this.skillsService.bulkUpsert(assessmentType, { data });
  }

  // @Get(':assessmentType')
  // async getAll(@Param('assessmentType') assessmentType: string) {
  //   return await this.skillsService.getAllRecords(assessmentType);
  // }
}
