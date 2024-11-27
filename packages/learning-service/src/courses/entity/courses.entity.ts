import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@skills-base/shared';

// Define field structure without Schema
interface Field {
  name: string;
  value: string;
}

@Schema()
export class Course extends BaseEntity {
  @ApiProperty({
    description: 'Unique course identifier',
    example: 'COURSE-001',
  })
  @Prop({ required: true, unique: true })
  courseId!: string;

  // The 5 static headers
  @ApiProperty({
    description: 'Category of the skill',
    example: 'Technical',
  })
  @Prop({ required: true })
  skillCategory!: string;

  @ApiProperty({
    description: 'Name of the skill',
    example: 'Software Testing',
  })
  @Prop({ required: true })
  skillName!: string;

  @ApiProperty({
    description: 'Required skill level (1-6)',
    minimum: 1,
    maximum: 6,
    example: 3,
  })
  @Prop({ required: true, min: 1, max: 6 })
  requiredLevel!: number;

  @ApiProperty({
    description: 'Career level for the course',
    example: 'Professional III',
  })
  @Prop({ required: true })
  careerLevel!: string;

  @ApiProperty({
    description: 'Level of the course',
    example: 'Intermediate',
  })
  @Prop({ required: true })
  courseLevel!: string;

  // Dynamic fields array - modified to prevent _id generation
  @ApiProperty({
    description: 'Additional course fields',
    example: [
      { name: 'courseName', value: 'Advanced Testing Techniques' },
      { name: 'provider', value: 'ISTQB' },
    ],
  })
  @Prop({
    type: [
      {
        _id: false, // This prevents _id generation
        name: String,
        value: String,
      },
    ],
  })
  fields!: Field[];

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-11-27T10:00:00.000Z',
  })
  @Prop({ default: Date.now })
  lastUpdated!: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
