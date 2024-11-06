import { Body, Controller, Post } from '@nestjs/common';
import { BulkUpdateCoursesDto } from '../dto/courses.dto';
import { BulkUpsertResponse } from '../interfaces/courses.interface';
import { CoursesService } from '../services/courses.service';

@Controller('api/courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post('bulk-update')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @UseInterceptors(LoggingInterceptor, TransformInterceptor)
  async bulkUpdate(
    @Body() bulkUpdateDto: BulkUpdateCoursesDto,
  ): Promise<BulkUpsertResponse> {
    const response = await this.coursesService.bulkUpsert(bulkUpdateDto);
    return response;
  }
}
