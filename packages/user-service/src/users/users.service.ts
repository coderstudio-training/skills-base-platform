// packages/user-service/src/users/users.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BaseService, isValidEmail, PaginationDto } from '@skills-base/shared';
import { Model } from 'mongoose';
import { Employee } from 'src/employees/entities/employee.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService extends BaseService<User> {
  private readonly logger = new Logger(UsersService.name);

  private userProfileCache: Map<
    string,
    {
      data: any;
    }
  > = new Map();

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Employee.name) private employeeModel: Model<Employee>,
  ) {
    super(userModel);
  }

  private isValidProfileCache(userId: string): boolean {
    return this.userProfileCache.has(userId);
  }

  private async updateProfileCache(userId: string, data: any): Promise<void> {
    this.userProfileCache.set(userId, {
      data,
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating new user with email: ${createUserDto.email}`);

    if (!isValidEmail(createUserDto.email)) {
      throw new Error('Invalid email format');
    }

    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findUserProfileById(id: string): Promise<any> {
    try {
      // Check if valid cache exists for this user
      if (this.isValidProfileCache(id)) {
        this.logger.debug(`Cache hit for user profile ${id}`);
        return this.userProfileCache.get(id)!.data;
      }

      this.logger.debug(
        `Cache miss for user profile ${id}, fetching from database`,
      );

      const user = await this.userModel
        .findById(id)
        .select('-__v -createdAt -updatedAt -password -_id')
        .lean()
        .transform((doc) => ({
          ...doc,
          _id: doc?._id?.toString(),
        }));

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      const employee = await this.employeeModel
        .findOne({ email: user.email })
        .select('-__v -createdAt -updatedAt -email -firstName -lastName -_id')
        .lean()
        .transform((doc) => ({
          ...doc,
          employeeId: doc?._id?.toString(),
        }));

      // Merge profiles and remove any undefined values
      const mergedProfile = Object.fromEntries(
        Object.entries({
          ...user,
          ...employee,
        }).filter(([, v]) => v != null),
      );

      // Update cache with the merged profile
      await this.updateProfileCache(id, mergedProfile);

      return mergedProfile;
    } catch (error) {
      this.logger.error(`Error finding user profile by ID ${id}:`, error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findAll(paginationDto: PaginationDto): Promise<User[]> {
    this.logger.log(
      `Fetching users with pagination: page ${paginationDto.page}, limit ${paginationDto.limit}`,
    );

    const skip = ((paginationDto.page ?? 1) - 1) * (paginationDto.limit ?? 10);

    return this.userModel
      .find()
      .skip(skip)
      .limit(paginationDto.limit ?? 10)
      .exec();
  }
}
