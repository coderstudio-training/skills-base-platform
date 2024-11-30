import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@skills-base/shared';

@Schema({ strict: false })
export class Employee extends BaseEntity {
  @ApiProperty({
    example: 12345,
    description: 'Unique employee identifier',
  })
  @Prop({ required: true, unique: true, index: true })
  employeeId!: number;

  @ApiProperty({
    example: 'john.doe@company.com',
    description: 'Employee email address',
  })
  @Prop()
  email?: string;

  @ApiProperty({
    example: 'John',
    description: 'Employee first name',
  })
  @Prop()
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Employee last name',
  })
  @Prop()
  lastName?: string;

  @ApiProperty({
    example: 'Engineering',
    description: 'Employee business unit',
  })
  @Prop()
  businessUnit?: string;

  @ApiProperty({
    example: 'Active',
    description: 'Current employment status',
  })
  @Prop()
  employmentStatus?: string;

  @ApiProperty({
    example: 'Senior Engineer',
    description: 'Employee grade or level',
  })
  @Prop()
  grade?: string;

  @ApiProperty({
    example: 'Jane Smith',
    description: "Employee's manager name",
  })
  @Prop()
  managerName?: string;

  // Allow dynamic properties
  [key: string]: any;
}

export const EmployeeEntity = SchemaFactory.createForClass(Employee);
