// packages/user-service/src/users/users.controller.ts

import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  UseInterceptors,
  Query,
  Request,
} from '@nestjs/common';
import {
  BaseController,
  LoggingInterceptor,
  TransformInterceptor,
  JwtAuthGuard,
  RolesGuard,
  Roles,
  UserRole,
  PaginationDto,
} from '@skills-base/shared';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class UsersController extends BaseController<User> {
  constructor(private readonly usersService: UsersService) {
    super(usersService);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: { user: { userId: string } }) {
    return this.usersService.findById(req.user.userId);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }
}
