// packages/user-service/src/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength, IsArray } from 'class-validator';
import { UserRole } from '@skills-base/shared';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsArray()
  roles: UserRole[] = [UserRole.USER];
}
