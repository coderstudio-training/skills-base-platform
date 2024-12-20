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
  InvalidateCache,
  JwtAuthGuard,
  Logger,
  PaginationDto,
  Permission,
  RateLimit,
  RedisCache,
  RequirePermissions,
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
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth('JWT-Admin')
export class UsersController extends BaseController<User> {
  private readonly logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) {
    super(usersService);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @RequirePermissions(Permission.MANAGE_SYSTEM)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @InvalidateCache({
    keyGenerators: [
      (ctx) => [`users:profile:${ctx.request.user.userId}`, 'users:list:*'],
    ],
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @RequirePermissions(Permission.VIEW_DASHBOARD)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns the user profile',
    type: User,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @RedisCache({
    keyGenerator: (ctx) => `users:profile:${ctx.request.user.userId}`,
  })
  async getProfile(@Request() req: { user: { userId: string } }) {
    this.logger.info(`Fetching user profile for user ID: ${req.user.userId}`);
    return this.usersService.findUserProfileById(req.user.userId);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @RequirePermissions(Permission.MANAGE_SYSTEM)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Returns all users',
    type: [User],
  })
  @RedisCache('users:list', 1800)
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  // @Get('picture/:email')
  // @Roles(UserRole.MANAGER, UserRole.ADMIN)
  // @ApiOperation({ summary: 'Get user picture by email' })
  // @ApiParam({
  //   name: 'email',
  //   example: 'adrian.oraya@stratpoint.com',
  //   required: true,
  //   type: 'string',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Returns the user picture URL',
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       picture: { type: 'string', nullable: true },
  //     },
  //   },
  // })
  // @ApiResponse({ status: 403, description: 'Forbidden' })
  // @ApiResponse({ status: 404, description: 'User not found' })
  // @RedisCache({
  //   keyGenerator: (ctx) => `users:picture:${ctx.request.params.email}`,
  // })
  // async getUserPicture(@Param('email') email: string) {
  //   const user = await this.usersService.findByEmail(email);
  //   return { picture: user?.picture || null };
  // }

  @Get('test')
  @RateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: 'Too many requests, please try again later',
  })
  @RequirePermissions(Permission.MANAGE_SYSTEM)
  @Roles(UserRole.ADMIN)
  test() {
    return { message: 'Security test endpoint' };
  }
}
