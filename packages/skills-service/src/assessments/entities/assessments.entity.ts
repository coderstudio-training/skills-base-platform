// assessments.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity } from '@skills-base/shared';

@Schema()
export class Assessments extends BaseEntity {
  @Prop({ required: true }) // Keep as Date in the entity
  timestamp!: Date;

  @Prop({ required: true })
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

@Schema()
export class SelfAssessments extends Assessments {
  @Prop({ required: true, unique: true, index: true })
  emailAddress!: string;
}

export const SelfAssessmentSchema =
  SchemaFactory.createForClass(SelfAssessments);

@Schema()
export class ManagerAssessment extends Assessments {
  @Prop({ required: true, unique: true, index: true })
  emailOfResource!: string;
}

export const ManagerAssessmentSchema =
  SchemaFactory.createForClass(ManagerAssessment);

@Schema()
export class AverageAssessments extends Assessments {
  @Prop({ required: true, unique: true, index: true })
  emailAddress!: string;
}

export const AverageAssessmentsSchema =
  SchemaFactory.createForClass(AverageAssessments);
