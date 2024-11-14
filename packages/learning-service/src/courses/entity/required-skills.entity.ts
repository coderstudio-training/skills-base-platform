import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({
  collection: 'capabilityRequiredSkills',
  versionKey: false,
})
export class RequiredSkills extends Document {
  @Prop({ required: true })
  capability!: string;

  @Prop({ required: true })
  careerLevel!: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  requiredSkills!: Record<string, number>;
}

export const RequiredSkillsSchema =
  SchemaFactory.createForClass(RequiredSkills);
