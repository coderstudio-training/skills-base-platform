import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  InvalidateCache,
  JwtAuthGuard,
  LoggingInterceptor,
  Permission,
  RedisCache,
  RequirePermissions,
  Roles,
  RolesGuard,
  TransformInterceptor,
  UserRole,
} from '@skills-base/shared';
import {
  BulkUpdateCoursesDto,
  BulkUpsertResponse,
  GetCoursesQueryDto,
  ResourcesResponseDto,
} from '../dto/courses.dto';
import { CoursesService } from '../services/courses.service';

@ApiTags('Courses')
@Controller('api/courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
@ApiBearerAuth('JWT-Admin')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post('bulk-update')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Bulk update courses',
    description:
      'Update multiple courses in a single operation. Requires admin role.',
  })
  @ApiResponse({
    status: 201,
    description: 'Courses successfully updated',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error in request body',
  })
  @InvalidateCache(['learning', 'learning:*'])
  async bulkUpdate(
    @Body() bulkUpdateDto: BulkUpdateCoursesDto,
  ): Promise<BulkUpsertResponse> {
    const response = await this.coursesService.bulkUpsert(bulkUpdateDto);
    return response;
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @RequirePermissions(Permission.MANAGE_SYSTEM)
  @ApiOperation({
    summary: 'Get all courses',
    description:
      'Retrieve all courses with optional filtering by category and level.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of courses retrieved successfully',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by skill category',
  })
  @ApiQuery({
    name: 'level',
    required: false,
    description: 'Filter by required level',
  })
  @RedisCache('learning:courses')
  async getCourses(@Query() query: GetCoursesQueryDto) {
    return this.coursesService.getCourses(query);
  }

  @Get('resources')
  @Roles(UserRole.ADMIN)
  @RequirePermissions(Permission.MANAGE_SYSTEM)
  @ApiOperation({
    summary: 'Get learning resources',
    description:
      'Retrieve all learning resources with optional category filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Resources retrieved successfully',
    type: ResourcesResponseDto,
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter resources by category',
  })
  @RedisCache('learning:resources')
  async getResources(
    @Query('category') category?: string,
  ): Promise<ResourcesResponseDto> {
    return this.coursesService.getResources(category);
  }
}
