import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from '@skills-base/shared';
import { BulkWriteResult } from 'mongodb';
import { Model } from 'mongoose';
import { Employee } from './entities/employee.entity';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);
  private readonly BATCH_SIZE = 1000;

  constructor(
    @InjectModel(Employee.name)
    private readonly employeeModel: Model<Employee>,
  ) {
    this.ensureIndexes();
  }

  private async ensureIndexes(): Promise<void> {
    try {
      await this.employeeModel.collection.createIndex(
        { employeeId: 1 },
        { unique: true, background: true },
      );
      this.logger.log('Indexes ensured for Employees collection');
    } catch (error) {
      this.logger.error(
        'Error ensuring indexes:',
        error instanceof Error ? error.message : error,
      );
    }
  }

  private validateEmployee(employee: Record<string, any>): string[] {
    const errors: string[] = [];

    if (!employee.employeeId) {
      errors.push('"employeeId" is required.');
    }

    return errors;
  }

  async bulkUpsert(employeesData: Record<string, any>): Promise<{
    summary: {
      total: number;
      updated: number;
      inserted: number;
      invalid: number;
      errors: number;
    };
    details: {
      invalidRecords: { record: Record<string, any>; errors: string[] }[];
      errors: any[];
    };
    statusCode: number;
  }> {
    const employees = Object.values(employeesData);
    const invalidRecords: { record: Record<string, any>; errors: string[] }[] =
      [];
    const errors: any[] = [];
    let modifiedCount = 0;
    let insertedCount = 0;

    // Validate and normalize employees
    const validEmployees = employees.filter((employee) => {
      const validationErrors = this.validateEmployee(employee);
      if (validationErrors.length > 0) {
        invalidRecords.push({ record: employee, errors: validationErrors });
        return false;
      }
      return true;
    });

    // Process valid employees in batches
    for (let i = 0; i < validEmployees.length; i += this.BATCH_SIZE) {
      const batch = validEmployees.slice(i, i + this.BATCH_SIZE);
      try {
        const result = await this.processBatch(batch);
        modifiedCount += result.modifiedCount;
        insertedCount += result.upsertedCount;
      } catch (error) {
        errors.push({
          batchIndex: Math.floor(i / this.BATCH_SIZE),
          error: error instanceof Error ? error.message : 'Unknown error',
          affectedRecords: batch.map((emp) => emp.employeeId),
        });
      }
    }

    return {
      summary: {
        total: employees.length,
        updated: modifiedCount,
        inserted: insertedCount,
        invalid: invalidRecords.length,
        errors: errors.length,
      },
      details: {
        invalidRecords,
        errors,
      },
      statusCode: 201,
    };
  }

  private async processBatch(batch: any[]): Promise<BulkWriteResult> {
    const operations = batch.map((employee) => ({
      updateOne: {
        filter: { employeeId: employee.employeeId },
        update: { $set: employee },
        upsert: true,
      },
    }));

    // Cast the result to BulkWriteResult
    const result = await this.employeeModel.bulkWrite(operations, {
      ordered: false,
    });
    return result as unknown as BulkWriteResult;
  }

  async findAll(paginationDto: PaginationDto): Promise<Employee[]> {
    this.logger.log(
      `Fetching employees with pagination: page ${paginationDto.page}, limit ${paginationDto.limit}`,
    );

    const skip = ((paginationDto.page ?? 1) - 1) * (paginationDto.limit ?? 10);

    return this.employeeModel
      .find()
      .skip(skip)
      .limit(paginationDto.limit ?? 10)
      .exec();
  }

  async findByEmployeeId(employeeId: number): Promise<Employee | null> {
    return this.employeeModel.findOne({ employeeId: employeeId }).exec();
  }

  async findByEmail(email: string): Promise<Employee | null> {
    return this.employeeModel.findOne({ email: email }).exec();
  }

  async findByManager(managerName: string): Promise<Employee[]> {
    return this.employeeModel.find({ managerName: managerName }).exec();
  }
}
