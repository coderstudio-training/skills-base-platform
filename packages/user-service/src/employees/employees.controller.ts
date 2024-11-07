import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  JwtAuthGuard,
  Logger,
  LoggingInterceptor,
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
    this.logger.info(
      `Starting bulk upsert with ${Object.keys(body).length} records`,
    );
    const result = await this.employeesService.bulkUpsert(body);
    this.logger.info(
      `Bulk upsert completed. Inserted: ${result.summary.inserted}, Updated: ${result.summary.updated}, Errors: ${result.summary.errors}, Invalids: ${result.summary.invalid}`,
    );
    return result;
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll() {
    return this.employeesService.findAll();
  }

  @Get(':employeeId')
  @Roles(UserRole.ADMIN)
  async findOne(@Param('employeeId') employeeId: number) {
    return this.employeesService.findByEmployeeId(employeeId);
  }
}
