import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({
  collection: 'capabilityRequiredSkills',
  versionKey: false,
})
export class RequiredSkills extends Document {
  @ApiProperty({
    description: 'The capability area (e.g., QA, Development)',
    example: 'QA',
  })
  @Prop({ required: true })
  capability!: string;

  @ApiProperty({
    description: 'Career level for the required skills',
    example: 'Professional III',
  })
  @Prop({ required: true })
  careerLevel!: string;

  @ApiProperty({
    description: 'Map of skill names to required levels',
    example: {
      'Software Testing': 3,
      'Test Automation': 2,
      'Test Planning': 3,
    },
  })
  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  requiredSkills!: Record<string, number>;
}

export const RequiredSkillsSchema =
  SchemaFactory.createForClass(RequiredSkills);
