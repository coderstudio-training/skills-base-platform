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
  JwtAuthGuard,
  LoggingInterceptor,
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

@Controller('api/courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post('bulk-update')
  @Roles(UserRole.ADMIN)
  async bulkUpdate(
    @Body() bulkUpdateDto: BulkUpdateCoursesDto,
  ): Promise<BulkUpsertResponse> {
    const response = await this.coursesService.bulkUpsert(bulkUpdateDto);
    return response;
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async getCourses(@Query() query: GetCoursesQueryDto) {
    return this.coursesService.getCourses(query);
  }

  @Get('resources')
  @Roles(UserRole.ADMIN)
  async getResources(
    @Query('category') category?: string,
  ): Promise<ResourcesResponseDto> {
    return this.coursesService.getResources(category);
  }
}
