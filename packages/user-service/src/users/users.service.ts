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

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Employee.name) private employeeModel: Model<Employee>,
  ) {
    super(userModel);
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
      .select('-__v -createdAt -updatedAt -email -firstName -lastName -_id') // exclude duplicate fields
      .lean()
      .transform((doc) => ({
        ...doc,
        employeeId: doc?._id?.toString(),
      }));

    // Merge profiles and remove any undefined values
    return Object.fromEntries(
      Object.entries({
        ...user,
        ...employee,
      }).filter(([v]) => v != null),
    );
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
