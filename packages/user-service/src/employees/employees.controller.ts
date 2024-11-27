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
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  JwtAuthGuard,
  LoggingInterceptor,
  PaginationDto,
  Roles,
  RolesGuard,
  TransformInterceptor,
  UserRole,
} from '@skills-base/shared';
import { EmployeeSearchDto } from './dto/search-employee.dto';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';

@ApiTags('employees')
@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
@ApiBearerAuth('JWT-auth')
export class EmployeesController {
  private readonly logger = new Logger(EmployeesController.name);

  constructor(private readonly employeesService: EmployeesService) {}

  @Post('sync')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Sync employee data' })
  @ApiResponse({
    status: 201,
    description: 'Employees data successfully synced',
    schema: {
      type: 'object',
      properties: {
        summary: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            updated: { type: 'number' },
            inserted: { type: 'number' },
            invalid: { type: 'number' },
            errors: { type: 'number' },
          },
        },
        details: {
          type: 'object',
          properties: {
            invalidRecords: { type: 'array' },
            errors: { type: 'array' },
          },
        },
        statusCode: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
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
  @ApiOperation({ summary: 'Get all employees with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of employees',
    type: Employee,
    isArray: true,
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.employeesService.findAll(paginationDto);
  }

  @Get('search')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Search employees' })
  @ApiResponse({
    status: 200,
    description: 'Returns filtered list of employees',
    type: Employee,
    isArray: true,
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  search(@Query() searchDto: EmployeeSearchDto) {
    return this.employeesService.search(searchDto);
  }

  @Get('business-units')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all business units and their distribution' })
  @ApiResponse({
    status: 200,
    description: 'Returns business units and their employee counts',
    schema: {
      type: 'object',
      properties: {
        businessUnits: {
          type: 'array',
          items: { type: 'string' },
        },
        distribution: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              count: { type: 'number' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getBusinessUnits() {
    return this.employeesService.getBusinessUnits();
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get employee statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns employee statistics',
    schema: {
      type: 'object',
      properties: {
        totalEmployeesCount: { type: 'number' },
        businessUnitsCount: { type: 'number' },
        activeEmployeesCount: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getEmployeeStats() {
    return this.employeesService.getEmployeeStats();
  }

  @Get(':employeeId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiParam({
    name: 'employeeId',
    description: 'Employee ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns employee details',
    type: Employee,
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async findOne(@Param('employeeId') employeeId: number) {
    return this.employeesService.findByEmployeeId(employeeId);
  }

  @Get('email/:email')
  @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get employee by email' })
  @ApiParam({
    name: 'email',
    description: 'Employee email address',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns employee details',
    type: Employee,
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async findByEmail(@Param('email') email: string) {
    this.logger.log(`Fetching employee details for email: ${email}`);
    const employee = await this.employeesService.findByEmail(email);
    if (!employee) {
      this.logger.warn(`No employee found for email: ${email}`);
    }
    return employee;
  }

  @Get('manager/:managerName')
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get employees by manager name' })
  @ApiParam({
    name: 'managerName',
    description: 'Manager full name',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns list of employees under the manager',
    type: Employee,
    isArray: true,
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findTeamMembers(@Param('managerName') managerName: string) {
    return this.employeesService.findByManager(managerName);
  }
}
