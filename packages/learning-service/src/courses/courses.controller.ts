import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { BulkUpdateCoursesDto } from './dto/courses.dto';

@Controller('api/courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post('bulk-update')
  async bulkUpdate(@Body() bulkUpdateDto: BulkUpdateCoursesDto) {
    return this.coursesService.bulkUpsert(bulkUpdateDto);
  }
}