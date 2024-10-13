// packages/user-service/src/users/users.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService, isValidEmail, PaginationDto } from '@skills-base/shared';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService extends BaseService<User> {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private userModel: Model<User>) {
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

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
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
