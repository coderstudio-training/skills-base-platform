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

  private defaultEmployeesCache: {
    data: any;
  } | null = null;

  private businessUnitsCache: {
    data: {
      businessUnits: string[];
      distribution: { name: string; count: number }[];
    };
  } | null = null;

  private employeeStatsCache: {
    data: {
      totalEmployeesCount: number;
      businessUnitsCount: number;
      activeEmployeesCount: number;
    };
  } | null = null;

  private managerEmployeesCache: Map<
    string,
    {
      data: any[];
    }
  > = new Map();

  constructor(
    @InjectModel(Employee.name)
    private readonly employeeModel: Model<Employee>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {
    this.ensureIndexes();
  }

  private isValidCache(): boolean {
    return this.defaultEmployeesCache !== null;
  }

  private isValidBusinessUnitsCache(): boolean {
    return this.businessUnitsCache !== null;
  }

  private isValidEmployeeStatsCache(): boolean {
    return this.employeeStatsCache !== null;
  }

  private isValidManagerCache(managerName: string): boolean {
    return this.managerEmployeesCache.has(managerName);
  }

  private async updateCache(data: any): Promise<void> {
    this.defaultEmployeesCache = {
      data,
    };
  }

  private async updateBusinessUnitsCache(data: {
    businessUnits: string[];
    distribution: { name: string; count: number }[];
  }): Promise<void> {
    this.businessUnitsCache = {
      data,
    };
  }

  private async updateEmployeeStatsCache(data: {
    totalEmployeesCount: number;
    businessUnitsCount: number;
    activeEmployeesCount: number;
  }): Promise<void> {
    this.employeeStatsCache = {
      data,
    };
  }

  private async updateManagerCache(
    managerName: string,
    data: any[],
  ): Promise<void> {
    this.managerEmployeesCache.set(managerName, {
      data,
    });
  }

  clearCache(): void {
    this.defaultEmployeesCache = null;
    this.businessUnitsCache = null;
    this.employeeStatsCache = null;
    this.managerEmployeesCache.clear();
    this.logger.debug('All caches cleared');
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

    this.clearCache();

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
    const isDefaultPagination = page === 1 && limit === 10;

    try {
      // Only check cache for default pagination
      if (isDefaultPagination && this.isValidCache()) {
        this.logger.debug('Cache hit for default pagination');
        return this.defaultEmployeesCache!.data;
      }

      if (isDefaultPagination) {
        this.logger.debug(
          'Cache miss for default pagination, fetching from database',
        );
      }

      const skip = (page - 1) * limit;

      const [employees, total] = await Promise.all([
        this.employeeModel
          .find()
          .select(
            '-_id employeeId firstName lastName email grade designation employmentStatus businessUnit picture',
          )
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        this.employeeModel.countDocuments(),
      ]);

      // Fetch user profiles for these employees
      const employeeEmails = employees.map((emp) => emp.email);
      const userProfiles = await this.userModel
        .find({ email: { $in: employeeEmails } })
        .select('-__v -createdAt -updatedAt -password -_id -googleId')
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

        return Object.fromEntries(
          Object.entries({
            ...employee,
            ...userProfile,
          }).filter(([, v]) => v != null),
        );
      });

      const totalPages = Math.ceil(total / limit);
      const result = {
        items: mergedProfiles,
        total,
        page,
        limit,
        totalPages,
      };

      // Update cache only for default pagination
      if (isDefaultPagination) {
        await this.updateCache(result);
      }

      return result;
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
        this.employeeModel
          .find(query)
          .skip(skip)
          .select(
            '-_id employeeId firstName lastName email grade designation employmentStatus businessUnit picture',
          )
          .limit(limit)
          .lean()
          .exec(),
        this.employeeModel.countDocuments(query),
      ]);

      // Fetch user profiles for these employees
      const employeeEmails = employees.map((emp) => emp.email);
      const userProfiles = await this.userModel
        .find({ email: { $in: employeeEmails } })
        .select('-__v -createdAt -updatedAt -password -_id -googleId')
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
      // Check if valid cache exists
      if (this.isValidBusinessUnitsCache()) {
        this.logger.debug('Cache hit for business units');
        return this.businessUnitsCache!.data;
      }

      this.logger.debug(
        'Cache miss for business units, fetching from database',
      );

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

      const result = { businessUnits, distribution };

      // Update cache with new data
      await this.updateBusinessUnitsCache(result);

      return result;
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
      // Check if valid cache exists
      if (this.isValidEmployeeStatsCache()) {
        this.logger.debug('Cache hit for employee stats');
        return this.employeeStatsCache!.data;
      }

      this.logger.debug(
        'Cache miss for employee stats, fetching from database',
      );

      const [totalEmployeesCount, businessUnitsCount, activeEmployeesCount] =
        await Promise.all([
          this.employeeModel.countDocuments(),
          this.employeeModel
            .distinct('businessUnit')
            .then((bus) => bus.filter((bu) => bu != null && bu !== '').length),
          this.employeeModel.countDocuments({ employmentStatus: 'Active' }),
        ]);

      const result = {
        totalEmployeesCount,
        businessUnitsCount,
        activeEmployeesCount,
      };

      // Update cache with new data
      await this.updateEmployeeStatsCache(result);

      return result;
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
      // Check if valid cache exists for this manager
      if (this.isValidManagerCache(managerName)) {
        this.logger.debug(`Cache hit for manager ${managerName}`);
        return this.managerEmployeesCache.get(managerName)!.data;
      }

      this.logger.debug(
        `Cache miss for manager ${managerName}, fetching from database`,
      );

      // Find employees by manager name
      const employees = await this.employeeModel
        .find({ managerName })
        .select(
          'employeeId grade firstName lastName jobLevel designation email managerName',
        )
        .lean()
        .transform((docs) =>
          docs.map((doc) => ({
            ...doc,
            employeeId: doc?._id?.toString(),
          })),
        );

      // If no employees found, cache empty array and return
      if (!employees || employees.length === 0) {
        await this.updateManagerCache(managerName, []);
        return [];
      }

      // Fetch user profiles for these employees
      const employeeEmails = employees.map((emp) => emp.email);
      const userProfiles = await this.userModel
        .find({ email: { $in: employeeEmails } })
        .select('-__v -createdAt -updatedAt -password -_id -googleId')
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

      // Update cache with the merged profiles
      await this.updateManagerCache(managerName, mergedProfiles);

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
