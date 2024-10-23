// src/courses/course.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Course extends Document {
  @Prop({ required: true, unique: true })
  courseId: string;

  @Prop({ required: true })
  courseName: string;

  @Prop({ required: true })
  skillCategory: string;

  @Prop({ required: true })
  skillName: string;

  @Prop({ required: true, min: 1, max: 6 })
  requiredLevel: number;

  @Prop({ required: true })
  careerLevel: string;

  @Prop({ required: true })
  courseLevel: string;

  @Prop({ required: true })
  provider: string;

  @Prop({ required: true })
  duration: string;

  @Prop({ required: true })
  format: string;

  @Prop()
  prerequisites: string;

  @Prop()
  learningObjectives: string;

  @Prop()
  assessment: string;

  @Prop()
  certificationOption: string;

  @Prop()
  businessValue: string;

  @Prop()
  recommendedFor: string;

  @Prop({ default: Date.now })
  lastUpdated: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);