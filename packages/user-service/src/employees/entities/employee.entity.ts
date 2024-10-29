import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity } from '@skills-base/shared';

@Schema({ strict: false })
export class Employee extends BaseEntity {
  @Prop({ required: true, unique: true, index: true })
  employeeId!: number;

  // Allow dynamic properties
  [key: string]: any;
}

export const EmployeeEntity = SchemaFactory.createForClass(Employee);
