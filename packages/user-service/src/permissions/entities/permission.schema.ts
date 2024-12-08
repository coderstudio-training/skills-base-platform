import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Permission } from '@skills-base/shared';
import { Document } from 'mongoose';

export interface IPermissionKey extends Document {
  permission: Permission;
  keyId: string;
  key: string;
  active: boolean;
  createdAt: Date;
}

@Schema({ timestamps: true })
export class PermissionKey {
  @Prop({ required: true, enum: Permission })
  permission!: Permission;

  @Prop({ required: true, unique: true })
  keyId!: string;

  @Prop({ required: true })
  key!: string;

  @Prop({ default: true })
  active!: boolean;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export const PermissionKeySchema = SchemaFactory.createForClass(PermissionKey);
PermissionKeySchema.index({ permission: 1, active: 1 });
