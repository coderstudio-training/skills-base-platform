// packages/user-service/src/users/entities/user.entity.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity, UserRole } from '@skills-base/shared';

@Schema()
export class User extends BaseEntity {
  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: false })
  password?: string;

  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({ type: [String], enum: UserRole, default: [UserRole.USER] })
  roles!: UserRole[];

  @Prop({ required: false, unique: true, sparse: true })
  googleId?: string;

  @Prop({ required: false })
  picture?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
