// packages/user-service/src/users/dto/create-user.dto.ts

import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  IsEnum,
  IsArray,
} from 'class-validator';
import { UserRole } from '@skills-base/shared';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles!: UserRole[];
}
