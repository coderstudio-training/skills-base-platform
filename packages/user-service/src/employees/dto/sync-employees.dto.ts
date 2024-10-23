import { BaseDto } from '@skills-base/shared';
import { IsNotEmpty, IsNumber, IsObject } from 'class-validator';

export class EmployeeDto extends BaseDto {
  @IsNumber()
  @IsNotEmpty()
  employee_id!: number;

  @IsObject()
  additionalProperties?: Record<string, any>;
}
