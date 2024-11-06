import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesController } from '../controllers/courses.controller';
import { Course, CourseSchema } from '../entity/courses.entity';
import { CoursesService } from '../services/courses.service';

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
