import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity, UserRole } from '@skills-base/shared';

@Schema({ strict: false })
export class Employee extends BaseEntity {
  @Prop({ required: true, unique: true, index: true })
  employee_id!: number;

  @Prop({
    required: true,
    type: [String],
    enum: UserRole,
    default: [UserRole.USER],
  })
  roles!: UserRole[];

  // Allow dynamic properties
  [key: string]: any;
}

export const EmployeeEntity = SchemaFactory.createForClass(Employee);
