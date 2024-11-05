import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Course, CourseSchema } from './entity/courses.entity';

@Module({
  imports: [
    //setup dynamic schema configuration
    MongooseModule.forFeatureAsync([
      {
        name: Course.name,
        useFactory: () => {
          const schema = CourseSchema;
          schema.index({ courseId: 1 }, { unique: true });
          return schema;
        },
      },
    ]),
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
