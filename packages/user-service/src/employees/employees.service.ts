import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BulkWriteResult } from 'mongodb';
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

  async bulkUpsert(employeesData: Record<string, any>): Promise<{
    updatedCount: number;
    statusCode: number;
    errors: any[];
  }> {
    let totalUpdatedCount = 0;
    const errors = [];
    const employees = Object.values(employeesData);

    for (let i = 0; i < employees.length; i += this.BATCH_SIZE) {
      const batch = employees.slice(i, i + this.BATCH_SIZE);
      try {
        const result = await this.processBatch(batch);
        totalUpdatedCount += result.modifiedCount + result.upsertedCount;
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
      updatedCount: totalUpdatedCount,
      statusCode: 200,
      errors,
    };
  }

  private async processBatch(batch: any[]): Promise<BulkWriteResult> {
    const operations = batch.map((employee) => ({
      updateOne: {
        filter: { employee_id: employee.employee_id },
        update: {
          $set: {
            ...employee,
            lastUpdated: new Date(),
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
