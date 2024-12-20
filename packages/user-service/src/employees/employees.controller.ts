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
  InvalidateCache,
  JwtAuthGuard,
  PaginationDto,
  Permission,
  RedisCache,
  RequirePermissions,
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
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth('JWT-Admin')
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
  @InvalidateCache(['employees:*', 'users:*'])
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
  @RequirePermissions(Permission.MANAGE_USERS)
  @ApiOperation({ summary: 'Get all employees with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of employees',
    type: Employee,
    isArray: true,
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @RedisCache('employees')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.employeesService.findAll(paginationDto);
  }

  @Get('search')
  @Roles(UserRole.ADMIN)
  @RequirePermissions(Permission.MANAGE_USERS)
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
  @RequirePermissions(Permission.VIEW_DASHBOARD)
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
  @RedisCache('employees:business-units')
  async getBusinessUnits() {
    return this.employeesService.getBusinessUnits();
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  @RequirePermissions(Permission.VIEW_DASHBOARD)
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
  @RedisCache('employee:stats')
  async getEmployeeStats() {
    return this.employeesService.getEmployeeStats();
  }

  @Get(':employeeId')
  @Roles(UserRole.ADMIN)
  @RequirePermissions(Permission.MANAGE_USERS)
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiParam({
    name: 'employeeId',
    description: 'Employee ID',
    example: '680',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns employee details',
    type: Employee,
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @RedisCache({
    keyGenerator: (ctx) =>
      `employee:employeeId:${ctx.request.params.employeeId}`,
  })
  async findOne(@Param('employeeId') employeeId: number) {
    return this.employeesService.findByEmployeeId(employeeId);
  }

  @Get('email/:email')
  @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Get employee by email' })
  @ApiParam({
    name: 'email',
    description: 'Employee email address',
    example: 'adrian.oraya@stratpoint.com',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns employee details',
    type: Employee,
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @RedisCache({
    keyGenerator: (ctx) => `employee:email:${ctx.request.params.email}`,
  })
  async findByEmail(@Param('email') email: string) {
    this.logger.log(`Fetching employee details for email: ${email}`);
    const employee = await this.employeesService.findByEmail(email);
    if (!employee) {
      this.logger.warn(`No employee found for email: ${email}`);
    }
    return employee;
  }

  @Get('manager/:managerName')
  @Roles(UserRole.MANAGER)
  @RequirePermissions(Permission.MANAGE_TEAM)
  @ApiOperation({ summary: 'Get employees by manager name' })
  @ApiParam({
    name: 'managerName',
    description: 'Manager full name',
    example: 'Adrian Oraya',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns list of employees under the manager',
    type: Employee,
    isArray: true,
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @RedisCache({
    keyGenerator: (ctx) => `employee:manager:${ctx.request.params.managerName}`,
  })
  async findTeamMembers(@Param('managerName') managerName: string) {
    return this.employeesService.findByManager(managerName);
  }
}
