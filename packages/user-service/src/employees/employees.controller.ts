import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  JwtAuthGuard,
  LoggingInterceptor,
  PaginationDto,
  Roles,
  RolesGuard,
  TransformInterceptor,
  UserRole,
} from '@skills-base/shared';
import { EmployeesService } from './employees.service';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class EmployeesController {
  private readonly logger = new Logger(EmployeesController.name);

  constructor(private readonly employeesService: EmployeesService) {}

  @Post('sync')
  @Roles(UserRole.ADMIN)
  async syncEmployees(@Body() body: Record<string, any>) {
    this.logger.log(
      `Starting bulk upsert with ${Object.keys(body).length} records`,
    );
    const result = await this.employeesService.bulkUpsert(body);
    this.logger.log(
      `Bulk upsert completed. Inserted: ${result.summary.inserted}, Updated: ${result.summary.updated}, Errors: ${result.summary.errors}, Invalids: ${result.summary.invalid}`,
    );
    return result;
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.employeesService.findAll(paginationDto);
  }

  @Get(':employeeId')
  @Roles(UserRole.ADMIN)
  async findOne(@Param('employeeId') employeeId: number) {
    return this.employeesService.findByEmployeeId(employeeId);
  }

  @Get('manager/:managerName')
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  async findTeamMembers(@Param('managerName') managerName: string) {
    return this.employeesService.findByManager(managerName);
  }
}
