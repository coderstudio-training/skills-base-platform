import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from '@skills-base/shared';
import { BulkWriteResult } from 'mongodb';
import { Model } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import { EmployeeSearchDto } from './dto/search-employee.dto';
import { Employee } from './entities/employee.entity';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);
  private readonly BATCH_SIZE = 1000;

  constructor(
    @InjectModel(Employee.name)
    private readonly employeeModel: Model<Employee>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {
    this.ensureIndexes();
  }

  private async ensureIndexes(): Promise<void> {
    try {
      await Promise.all([
        this.employeeModel.collection.createIndex(
          { employeeId: 1 },
          { unique: true, background: true },
        ),
      ]);
      await Promise.all([
        this.employeeModel.collection.createIndex(
          { employeeId: 1 },
          { unique: true, background: true },
        ),
      ]);
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

  async findAll(paginationDto: PaginationDto) {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const skip = (page - 1) * limit;

    try {
      const [employees, total] = await Promise.all([
        this.employeeModel.find().skip(skip).limit(limit).lean().exec(),
        this.employeeModel.countDocuments(),
      ]);

      // Fetch user profiles for these employees
      const employeeEmails = employees.map((emp) => emp.email);
      const userProfiles = await this.userModel
        .find({ email: { $in: employeeEmails } })
        .select('-__v -createdAt -updatedAt -password -_id')
        .lean()
        .transform((docs) =>
          docs.map((doc) => ({
            ...doc,
            _id: doc?._id?.toString(),
          })),
        );

      // Merge employee and user profiles
      const mergedProfiles = employees.map((employee) => {
        const userProfile = userProfiles.find(
          (user) => user.email === employee.email,
        );

        // Merge profiles and remove any undefined values
        return Object.fromEntries(
          Object.entries({
            ...employee,
            ...userProfile,
          }).filter(([, v]) => v != null),
        );
      });

      const totalPages = Math.ceil(total / limit);

      return {
        items: mergedProfiles,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      this.logger.error('Error fetching employees:', error);
      throw error;
    }
  }

  async search(searchDto: EmployeeSearchDto) {
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 10;
    const skip = (page - 1) * limit;

    try {
      const searchRegex = new RegExp(searchDto.searchTerm || '', 'i');
      const query: any = {
        $or: [{ firstName: searchRegex }, { skill: searchRegex }],
      };

      // Add business unit filter if specified
      if (
        searchDto.businessUnit &&
        searchDto.businessUnit !== 'All Business Units'
      ) {
        query.businessUnit = searchDto.businessUnit;
      }

      const [employees, total] = await Promise.all([
        this.employeeModel.find(query).skip(skip).limit(limit).lean().exec(),
        this.employeeModel.countDocuments(query),
      ]);

      // Fetch user profiles for these employees
      const employeeEmails = employees.map((emp) => emp.email);
      const userProfiles = await this.userModel
        .find({ email: { $in: employeeEmails } })
        .select('-__v -createdAt -updatedAt -password -_id')
        .lean()
        .transform((docs) =>
          docs.map((doc) => ({
            ...doc,
            _id: doc?._id?.toString(),
          })),
        );

      // Merge employee and user profiles
      const mergedProfiles = employees.map((employee) => {
        const userProfile = userProfiles.find(
          (user) => user.email === employee.email,
        );

        // Merge profiles and remove any undefined values
        return Object.fromEntries(
          Object.entries({
            ...employee,
            ...userProfile,
          }).filter(([, v]) => v != null),
        );
      });

      const totalPages = Math.ceil(total / limit);

      return {
        items: mergedProfiles,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      this.logger.error('Error searching employees:', error);
      throw error;
    }
  }

  async getBusinessUnits(): Promise<{
    businessUnits: string[];
    distribution: { name: string; count: number }[];
  }> {
    try {
      const [businessUnits, distribution] = await Promise.all([
        this.employeeModel
          .distinct('businessUnit')
          .then((bus) => bus.filter((bu) => bu != null && bu !== '')),
        this.employeeModel
          .aggregate([
            {
              $group: {
                _id: '$businessUnit',
                count: { $sum: 1 },
              },
            },
            {
              $match: {
                _id: { $ne: '' },
              },
            },
            {
              $project: {
                _id: 0,
                name: '$_id',
                count: 1,
              },
            },
            { $sort: { count: -1 } },
          ])
          .exec(),
      ]);

      return { businessUnits, distribution };
    } catch (error) {
      this.logger.error('Error fetching business units:', error);
      throw error;
    }
  }

  async getEmployeeStats(): Promise<{
    totalEmployeesCount: number;
    businessUnitsCount: number;
    activeEmployeesCount: number;
  }> {
    try {
      const [totalEmployeesCount, businessUnitsCount, activeEmployeesCount] =
        await Promise.all([
          this.employeeModel.countDocuments(),
          this.employeeModel
            .distinct('businessUnit')
            .then((bus) => bus.filter((bu) => bu != null && bu !== '').length),
          this.employeeModel.countDocuments({ employmentStatus: 'Active' }),
        ]);

      return {
        totalEmployeesCount,
        businessUnitsCount,
        activeEmployeesCount,
      };
    } catch (error) {
      this.logger.error('Error fetching employee statistics:', error);
      throw error;
    }
  }

  async findByEmployeeId(employeeId: number): Promise<Employee | null> {
    return this.employeeModel.findOne({ employeeId: employeeId }).exec();
  }

  async findByEmail(email: string): Promise<Employee | null> {
    return this.employeeModel.findOne({ email: email }).exec();
  }

  async findByManager(managerName: string): Promise<any[]> {
    try {
      // Find employees by manager name
      const employees = await this.employeeModel
        .find({ managerName })
        .select('-__v -createdAt -updatedAt -_id')
        .lean()
        .transform((docs) =>
          docs.map((doc) => ({
            ...doc,
            employeeId: doc?._id?.toString(),
          })),
        );

      // If no employees found, return empty array
      if (!employees || employees.length === 0) {
        return [];
      }

      // Fetch user profiles for these employees
      const employeeEmails = employees.map((emp) => emp.email);
      const userProfiles = await this.userModel
        .find({ email: { $in: employeeEmails } })
        .select('-__v -createdAt -updatedAt -password -_id')
        .lean()
        .transform((docs) =>
          docs.map((doc) => ({
            ...doc,
            _id: doc?._id?.toString(),
          })),
        );

      // Merge employee and user profiles
      const mergedProfiles = employees.map((employee) => {
        const userProfile = userProfiles.find(
          (user) => user.email === employee.email,
        );

        // Merge profiles and remove any undefined values
        return Object.fromEntries(
          Object.entries({
            ...employee,
            ...userProfile,
          }).filter(([, v]) => v != null),
        );
      });

      return mergedProfiles;
    } catch (error) {
      this.logger.error(
        `Error finding employees by manager ${managerName}:`,
        error,
      );
      throw error;
    }
  }
}
