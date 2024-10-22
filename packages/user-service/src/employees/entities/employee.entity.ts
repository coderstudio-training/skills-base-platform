import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ strict: false })
export class Employee extends Document {
  @Prop({ required: true, unique: true, index: true })
  employee_id!: number;

  [key: string]: any;
}

export const EmployeeEntity = SchemaFactory.createForClass(Employee);
