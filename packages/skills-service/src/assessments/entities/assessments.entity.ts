// assessments.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Assessments extends Document {
  @Prop({ required: true }) // Keep as Date in the entity
  timestamp!: Date;

  @Prop({ required: true, unique: true, index: true })
  emailAddress!: string;

  @Prop({ required: true })
  nameOfResource!: string;

  @Prop({ required: false })
  emailOfResource?: string;

  @Prop({ required: true })
  careerLevelOfResource!: string;

  @Prop({ required: true })
  nameOfRespondent!: string;

  @Prop({ required: true })
  capability!: string;

  @Prop({ type: Map, of: Number, default: {} })
  skills!: Record<string, number>;

  @Prop({ default: Date.now })
  lastUpdated!: Date;
}

export const BaseSkillsSchema = SchemaFactory.createForClass(Assessments);

// SelfSkills entity
@Schema()
export class SelfAssessments extends Assessments {}

export const SelfAssessmentSchema =
  SchemaFactory.createForClass(SelfAssessments);

// ManagerSkills entity
@Schema()
export class ManagerAssessment extends Assessments {
  @Prop({ required: true })
  emailOfResource!: string;
}

export const ManagerAssessmentSchema =
  SchemaFactory.createForClass(ManagerAssessment);
