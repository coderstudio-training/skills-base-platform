import { Type } from 'class-transformer';
import { IsNumber, ValidateNested, IsObject } from 'class-validator';

export class EmployeeDto {
  @IsNumber()
  employee_id!: number;

  @IsObject()
  additionalProperties?: Record<string, any>;
}

export class BulkUpdateEmployeesDto {
  @ValidateNested({ each: true })
  @Type(() => EmployeeDto)
  data?: EmployeeDto[];
}
