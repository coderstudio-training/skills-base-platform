import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity } from '@skills-base/shared';

@Schema()
export class SkillGap extends BaseEntity {
  @Prop({ required: true })
  emailAddress!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  careerLevel!: string;

  @Prop({ type: Object })
  skillGaps!: Record<string, number>;

  @Prop({ type: Date, default: Date.now })
  computedDate!: Date;
}

export const SkillGapSchema = SchemaFactory.createForClass(SkillGap);
