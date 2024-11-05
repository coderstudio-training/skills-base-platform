import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Define field structure without Schema
interface Field {
  name: string;
  value: string;
}

@Schema()
export class Course extends Document {
  @Prop({ required: true, unique: true })
  courseId: string;

  // The 5 static headers
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

  // Dynamic fields array - modified to prevent _id generation
  @Prop({
    type: [
      {
        _id: false, // This prevents _id generation
        name: String,
        value: String,
      },
    ],
  })
  fields: Field[];

  @Prop({ default: Date.now })
  lastUpdated: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
