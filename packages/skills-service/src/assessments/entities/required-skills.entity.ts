import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class RequiredSkills extends Document {
  @Prop({ required: true, unique: true, index: true })
  careerLevel!: string;

  @Prop({ type: Map, of: Number, default: {} })
  skills!: Record<string, number>;

  @Prop({ default: Date.now })
  lastUpdated!: Date;
}

export const RequiredSkillsSchema =
  SchemaFactory.createForClass(RequiredSkills);
