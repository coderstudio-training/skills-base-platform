import { Body, Controller, Post } from '@nestjs/common';
import { BulkUpsertResponse } from './courses.interface';
import { CoursesService } from './courses.service';
import { BulkUpdateCoursesDto } from './dto/courses.dto';

@Controller('api/courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post('bulk-update')
  async bulkUpdate(
    @Body() bulkUpdateDto: BulkUpdateCoursesDto,
  ): Promise<BulkUpsertResponse> {
    return this.coursesService.bulkUpsert(bulkUpdateDto);
  }
}
