import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
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
        { employee_id: 1 },
        { unique: true, background: true },
      );
      this.logger.log('Indexes ensured for Employees collection');
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error ensuring indexes: ${error.message}`);
      } else {
        this.logger.error(`Unknown error: ${error}`);
      }
    }
  }

  private validateEmployee(employee: Record<string, any>): string[] {
    const errors: string[] = [];

    if (!employee.employee_id) {
      errors.push('Employee ID is required');
    }

    // if (!employee.role) {
    //   errors.push('Role is required');
    // }

    return errors;
  }

  async bulkUpsert(employeesData: Record<string, any>): Promise<{
    employeeCount: number;
    updatedCount: number;
    modifiedCount: number;
    insertedCount: number;
    statusCode: number;
    errors: any[];
    invalidRecords: { record: Record<string, any>; errors: string[] }[];
  }> {
    let totalUpdatedCount = 0;
    let modifiedCount = 0;
    let insertedCount = 0;
    const errors = [];
    const invalidRecords: { record: Record<string, any>; errors: string[] }[] =
      [];
    const employees = Object.values(employeesData);

    // Validate all employees first
    const validEmployees = employees.filter((employee) => {
      const validationErrors = this.validateEmployee(employee);
      if (validationErrors.length > 0) {
        invalidRecords.push({
          record: employee,
          errors: validationErrors,
        });
        return false;
      }
      return true;
    });

    // If there are invalid records, throw BadRequestException
    if (invalidRecords.length > 0) {
      this.logger.error('Invalid records found', invalidRecords);
    }

    // Process valid employees in batches
    for (let i = 0; i < validEmployees.length; i += this.BATCH_SIZE) {
      const batch = validEmployees.slice(i, i + this.BATCH_SIZE);
      try {
        const result = await this.processBatch(batch);
        totalUpdatedCount += result.modifiedCount + result.upsertedCount;
        modifiedCount += result.modifiedCount;
        insertedCount += result.upsertedCount;
        this.logger.debug(
          `Batch ${Math.floor(i / this.BATCH_SIZE) + 1} processed successfully`,
        );
      } catch (error) {
        if (error instanceof Error) {
          const batchNumber = Math.floor(i / this.BATCH_SIZE) + 1;
          this.logger.error(
            `Error processing batch ${batchNumber}: ${error.message}`,
          );
          errors.push({
            batchIndex: batchNumber,
            error: error.message,
            affectedRecords: batch.map((emp) => emp.employee_id),
          });
        } else {
          this.logger.error(`Unknown error: ${error}`);
        }
      }
    }

    return {
      employeeCount: employees.length,
      updatedCount: totalUpdatedCount,
      modifiedCount,
      insertedCount,
      statusCode: errors.length > 0 ? 207 : 201,
      errors,
      invalidRecords,
    };
  }

  private async processBatch(batch: any[]): Promise<BulkWriteResult> {
    const operations = batch.map((employee) => ({
      updateOne: {
        filter: { employee_id: employee.employee_id },
        update: {
          $set: {
            ...employee,
          },
        },
        upsert: true,
      },
    }));

    const result = await this.employeeModel.bulkWrite(operations, {
      ordered: false,
    });

    this.logger.debug(
      `Batch processed: ${result.modifiedCount} updated, ${result.upsertedCount} inserted`,
    );
    return result;
  }

  async findAll(): Promise<Employee[]> {
    return this.employeeModel.find().exec();
  }

  async findByEmployeeId(employeeId: number): Promise<Employee | null> {
    return this.employeeModel.findOne({ employee_id: employeeId }).exec();
  }
}
