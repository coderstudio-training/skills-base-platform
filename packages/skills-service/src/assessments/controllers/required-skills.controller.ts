// src/required-skills/controllers/required-skills.controller.ts
import { Body, Controller, Get } from '@nestjs/common';
import { RequiredSkillsDto } from '../dto/required-skills.dto';
import { RequiredSkillsService } from '../services/required-skills.service';

@Controller('required-skills')
export class RequiredSkillsController {
  constructor(private readonly requiredSkillsService: RequiredSkillsService) {}

  // GET endpoint to fetch required skills by business unit (prefixBU) from the body
  @Get()
  async getRequiredSkills(
    @Body() body: { prefixBU: string },
  ): Promise<RequiredSkillsDto[]> {
    const { prefixBU } = body;
    return this.requiredSkillsService.getRequiredSkillsByBU(prefixBU);
  }
}
