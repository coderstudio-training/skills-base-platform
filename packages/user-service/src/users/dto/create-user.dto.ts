// packages/user-service/src/users/dto/create-user.dto.ts

import { UserRole } from '@skills-base/shared';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  password?: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles!: UserRole[];

  @IsString()
  @IsOptional()
  googleId?: string;

  @IsString()
  @IsOptional()
  picture?: string;
}
