// assessments.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class BaseSkills extends Document {
  @Prop({ required: true, unique: true, index: true })
  email!: string;

  @Prop({ required: true })
  timestamp!: Date;

  @Prop({ required: true })
  resourceName!: string;

  @Prop({ required: false }) 
  emailOfResource?: string;

  @Prop({ required: true })
  capability!: string;

  @Prop({ required: true })
  careerLevel!: string;

  @Prop({ required: true })
  nameOfRespondent!: string;

  @Prop({ type: Map, of: Number, default: {} })
  skills!: Record<string, number>;

  @Prop({ default: Date.now })
  lastUpdated!: Date;
}

export const BaseSkillsSchema = SchemaFactory.createForClass(BaseSkills);

// SelfSkills entity
@Schema()
export class SelfSkills extends BaseSkills {}

export const SelfSkillsSchema = SchemaFactory.createForClass(SelfSkills);

// ManagerSkills entity
@Schema()
export class ManagerSkills extends BaseSkills {}

export const ManagerSkillsSchema = SchemaFactory.createForClass(ManagerSkills);
