import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
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
      `Bulk upsert completed. Inserted: ${result.summary.inserted}, Updated: ${result.summary.updated}, Errors: ${result.summary.errors}, Invalids: ${result.summary.invalid}`,
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
