import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  BaseController,
  JwtAuthGuard,
  LoggingInterceptor,
  PaginationDto,
  Roles,
  RolesGuard,
  TransformInterceptor,
  UserRole,
} from '@skills-base/shared';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
@ApiBearerAuth('JWT-Admin')
export class UsersController extends BaseController<User> {
  constructor(private readonly usersService: UsersService) {
    super(usersService);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns the user profile',
    type: User,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req: { user: { userId: string } }) {
    return this.usersService.findUserProfileById(req.user.userId);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Returns all users',
    type: [User],
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }
}
