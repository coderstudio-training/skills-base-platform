import { Body, Controller, Get, Param, Post } from '@nestjs/common';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { Roles } from '../auth/roles.decorator';
// import { RolesGuard } from '../auth/roles.guard';
// import { UserRole } from '../auth/user-role.enum';
import { SelfSkillsService } from './assessments.service';
import { BulkUpdateSelfSkillsDto } from './dto/assessments.dto';

@Controller('api/skills-matrix')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class SelfSkillsController {
  constructor(private readonly SelfSkillsService: SelfSkillsService) {}

  @Post('bulk-update')
  // @Roles(UserRole.ADMIN)
  async bulkUpdate(@Body() bulkUpdateDto: BulkUpdateSelfSkillsDto) {
    return this.SelfSkillsService.bulkUpsert(bulkUpdateDto);
  }

  @Get()
  // @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async findAll() {
    return this.SelfSkillsService.findAll();
  }

  @Get('email/:email') // Updated to use email as the parameter
  // @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE)
  async findOne(@Param('email') email: string) {
    return this.SelfSkillsService.findByEmail(email); // Updated method call to match the service
  }

  @Get('analytics/skills-distribution')
  // @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async getSkillsDistribution() {
    return this.SelfSkillsService.getSkillsDistribution();
  }
}
