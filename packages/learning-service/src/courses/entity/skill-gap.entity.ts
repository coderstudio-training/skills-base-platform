import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'AI_skillGaps' })
export class SkillGap extends Document {
  @Prop({ required: true })
  email!: string;

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
