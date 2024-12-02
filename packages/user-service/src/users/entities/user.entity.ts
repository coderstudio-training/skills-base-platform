import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity, UserRole } from '@skills-base/shared';

@Schema()
export class User extends BaseEntity {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @Prop({ required: true, unique: true })
  email!: string;

  @ApiProperty({ required: false, description: 'Hashed password' })
  @Prop({ required: false })
  password?: string;

  @ApiProperty({ example: 'John', description: 'User first name' })
  @Prop({ required: true })
  firstName!: string;

  @ApiProperty({ example: 'Doe', description: 'User last name' })
  @Prop({ required: true })
  lastName!: string;

  @ApiProperty({
    enum: UserRole,
    isArray: true,
    example: [UserRole.USER],
    description: 'User roles',
  })
  @Prop({ type: [String], enum: UserRole, default: [UserRole.USER] })
  roles!: UserRole[];

  @ApiProperty({
    required: false,
    example: '123456789',
    description: 'Google OAuth ID',
  })
  @Prop({ required: false, unique: true, sparse: true })
  googleId?: string;

  @ApiProperty({
    required: false,
    example: 'https://example.com/picture.jpg',
    description: 'User profile picture URL',
  })
  @Prop({ required: false })
  picture?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
