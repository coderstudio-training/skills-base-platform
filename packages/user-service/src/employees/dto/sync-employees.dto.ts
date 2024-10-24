import { BaseDto, UserRole } from '@skills-base/shared';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
} from 'class-validator';

export class EmployeeDto extends BaseDto {
  @IsNumber()
  @IsNotEmpty()
  employee_id!: number;

  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles: UserRole[] = [UserRole.USER];

  @IsObject()
  additionalProperties?: Record<string, any>;
}
