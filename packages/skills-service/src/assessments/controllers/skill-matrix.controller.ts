import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@skills-base/shared';
import { SkillsMatrixService } from '../services/skills-matrix.service';

@ApiTags('Skill Matrix')
@Controller('api/skill-metrics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SkillMatrixController {
  constructor(private readonly skillMatrixService: SkillsMatrixService) {}

  @Get()
  // @Roles(UserRole.ADMIN, UserRole.MANAGER)
  // @ApiOperation({ summary: 'Get skills matrix for all employees' })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'Successfully retrieved skills matrix for all employees',
  // })
  // @ApiResponse({
  //   status: HttpStatus.FORBIDDEN,
  //   description: 'User does not have sufficient permissions',
  // })
  async getAllEmployeesSkillsMatrix() {
    return this.skillMatrixService.getAllEmployeesSkillsData();
  }
}
