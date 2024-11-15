// src/required-skills/controllers/required-skills.controller.ts
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { RequiredSkillsDto } from '../dto/required-skills.dto';
import { SkillGapsDto } from '../dto/skill-gaps.dto';
import { EmployeeSkillsResponseDto } from '../dto/user-skills-data.dto';
import { RequiredSkillsService } from '../services/required-skills.service';

@Controller('api/skills')
export class RequiredSkillsController {
  constructor(private readonly requiredSkillsService: RequiredSkillsService) {}

  // GET endpoint to fetch skill gaps for a specific employee by email
  @Get('gaps')
  async getEmployeeSkillGaps(
    @Query('email') email: string,
  ): Promise<SkillGapsDto> {
    if (!email) {
      throw new NotFoundException('Email query parameter is required');
    }
    return this.requiredSkillsService.getEmployeeSkillGaps(email);
  }
  // GET endpoint to fetch required skills by business unit (prefixBU) from the body
  @Get()
  async getRequiredSkills(
    @Body() body: { prefixBU: string },
  ): Promise<RequiredSkillsDto[]> {
    const { prefixBU } = body;
    return this.requiredSkillsService.getRequiredSkillsByBU(prefixBU);
  }

  @Get('user-data')
  async getUserSkillData(
    @Query('email') email: string,
  ): Promise<EmployeeSkillsResponseDto> {
    return this.requiredSkillsService.getEmployeeSkillsData(email);
  }
}
