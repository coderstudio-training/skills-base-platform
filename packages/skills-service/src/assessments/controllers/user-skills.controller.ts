// src/required-skills/controllers/required-skills.controller.ts
import { Body, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, Roles, RolesGuard, UserRole } from '@skills-base/shared';
import { RequiredSkillsDto } from '../dto/required-skills.dto';
import { TransformedSkillsResponseDto } from '../dto/user-skills.dto';
import { UserSkillsService } from '../services/user-skills.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/skills')
export class RequiredSkillsController {
  constructor(private readonly userSkillsService: UserSkillsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('required-skills')
  async getRequiredSkills(
    @Body() body: { prefixBU: string },
  ): Promise<RequiredSkillsDto[]> {
    const { prefixBU } = body;
    return this.userSkillsService.getRequiredSkillsByBU(prefixBU);
  }

  @Roles(UserRole.USER)
  @Get('skill-matrix')
  async getSkillMatrix(
    @Query('email') email: string,
  ): Promise<TransformedSkillsResponseDto> {
    return this.userSkillsService.getTransformedSkillsData(email);
  }

  // // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Get('user-data')
  // async getUserSkillData(
  //   @Query('email') email: string,
  // ): Promise<EmployeeSkillsResponseDto> {
  //   return this.userSkillsService.getEmployeeSkillsData(email);
  // }
}
