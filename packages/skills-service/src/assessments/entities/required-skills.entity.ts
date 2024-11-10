// src/required-skills/entities/required-skills.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class RequiredSkills extends Document {
  @Prop({ required: true })
  capability!: string;

  @Prop({ required: true })
  careerLevel!: string;

  @Prop({ type: Map, of: Number, required: true })
  requiredSkills!: Map<string, number>;

  @Prop({ default: Date.now })
  lastUpdated!: Date;
}

export const RequiredSkillsSchema =
  SchemaFactory.createForClass(RequiredSkills);
