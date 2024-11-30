import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from '@skills-base/shared';
import { IsNotEmpty, IsNumber, IsObject } from 'class-validator';

export class EmployeeDto extends BaseDto {
  @ApiProperty({
    description: 'Unique employee identifier',
    example: 12345,
  })
  @IsNumber()
  @IsNotEmpty()
  employeeId!: number;

  @ApiProperty({
    description: 'Additional employee properties',
    example: {
      email: 'john.doe@company.com',
      firstName: 'John',
      lastName: 'Doe',
      businessUnit: 'Engineering',
    },
    required: false,
  })
  @IsObject()
  additionalProperties?: Record<string, any>;
}
