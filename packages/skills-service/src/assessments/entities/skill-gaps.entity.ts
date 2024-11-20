// src/required-skills/entities/required-skills.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity } from '@skills-base/shared';

@Schema()
export class SkillGaps extends BaseEntity {
  @Prop({ required: true, unique: true, index: true })
  emailAddress!: string;

  @Prop({ required: true })
  nameOfResource!: string;

  @Prop({ required: true })
  careerLevel!: string;

  @Prop({ required: true })
  capability!: string;

  @Prop({ type: Map, of: Number, required: true })
  skillAverages!: Map<string, number>;

  @Prop({ type: Map, of: Number, required: true })
  skillGaps!: Map<string, number>;

  @Prop({ default: Date.now })
  lastUpdated!: Date;
}

export const SkillGapsSchema = SchemaFactory.createForClass(SkillGaps);
