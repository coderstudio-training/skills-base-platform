import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { Employee, EmployeeEntity } from './entities/employee.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeEntity },
    ]),
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [MongooseModule, EmployeesService],
})
export class EmployeesModule {}
