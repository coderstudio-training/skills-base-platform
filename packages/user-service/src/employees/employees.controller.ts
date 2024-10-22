import { Body, Controller, Post, Get, Param, Logger } from '@nestjs/common';
import { EmployeesService } from './employees.service';

@Controller('employees')
export class EmployeesController {
  private readonly logger = new Logger(EmployeesController.name);

  constructor(private readonly employeesService: EmployeesService) {}

  @Post('sync')
  async syncEmployees(@Body() body: Record<string, any>) {
    this.logger.log(
      `Starting bulk upsert with ${Object.keys(body).length} records`,
    );
    const result = await this.employeesService.bulkUpsert(body);
    this.logger.log(
      `Bulk upsert completed. Updated: ${result.updatedCount}, Errors: ${result.errors.length}`,
    );
    return result;
  }

  @Get()
  async findAll() {
    return this.employeesService.findAll();
  }

  @Get(':employeeId')
  async findOne(@Param('employeeId') employeeId: number) {
    return this.employeesService.findByEmployeeId(employeeId);
  }
}
