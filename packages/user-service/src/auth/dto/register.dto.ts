import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@skills-base/shared';
import { IsArray, IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    type: String,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @ApiProperty({
    description: 'User password (minimum 8 characters)',
    example: 'strongpassword123',
    type: String,
    minLength: 8,
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    type: String,
  })
  @IsString({ message: 'First name must be a string' })
  firstName!: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    type: String,
  })
  @IsString({ message: 'Last name must be a string' })
  lastName!: string;

  @ApiProperty({
    description: 'User roles',
    example: [UserRole.STAFF],
    type: [String],
    default: [UserRole.STAFF],
  })
  @IsArray({ message: 'Roles must be an array' })
  roles: UserRole[] = [UserRole.STAFF];
}
