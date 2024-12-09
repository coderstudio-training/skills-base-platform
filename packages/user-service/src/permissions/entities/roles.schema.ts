import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Roles extends Document {
  @Prop({ required: true, unique: true })
  name!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: false, unique: true })
  permissions?: string[];
}

export const RolesSchema = SchemaFactory.createForClass(Roles);
