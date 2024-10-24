import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class SelfSkills extends Document {
  @Prop({ required: true, unique: true, index: true })
  email!: string; // Definite assignment assertion

  @Prop({ required: true })
  timestamp!: Date; // Definite assignment assertion

  @Prop({ required: true })
  resourceName!: string; // Definite assignment assertion

  @Prop({ required: true })
  capability!: string; // Definite assignment assertion

  @Prop({ required: true })
  careerLevel!: string; // Definite assignment assertion

  // Changed from Skill[] to Record<string, number> for skill name and level mapping
  @Prop({ type: Map, of: Number, default: {} }) 
  skills!: Record<string, number>; // Definite assignment assertion

  @Prop({ default: Date.now })
  lastUpdated!: Date; // Definite assignment assertion
}

export const SelfSkillsSchema = SchemaFactory.createForClass(SelfSkills);
