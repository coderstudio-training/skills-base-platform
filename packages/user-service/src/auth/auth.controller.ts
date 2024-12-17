// packages/user-service/src/auth/auth.controller.ts
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  GoogleAuthSecurityService,
  Logger,
  RateLimit,
} from '@skills-base/shared';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private logger: Logger = new Logger(AuthController.name),
    private googleAuthSecurityService: GoogleAuthSecurityService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account with the provided details',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      example: {
        id: 'user-uuid',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        roles: ['USER'],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation failed',
    schema: {
      example: {
        statusCode: 400,
        message: ['email must be an email', 'password is too short'],
      },
    },
  })
  @RateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 1000,
    message: 'Too many requests, please try again later',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login with email and password',
    description: 'Authenticate user with email and password',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    schema: {
      example: {
        accessToken: 'jwt-token',
        user: {
          id: 'user-uuid',
          email: 'user@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid email or password',
      },
    },
  })
  @RateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 1000,
    message: 'Too many requests, please try again later',
  })
  @Post('login')
  // @UseGuards(BruteForceGuard)
  async login(@Req() request: Request, @Body() loginDto: LoginDto) {
    try {
      const user = await this.authService.login(loginDto);
      // Reset attempts on successful login
      // await this.bruteForceGuard.handleLoginResult(request, true);

      return user;
    } catch (error) {
      // Increment attempts on failed login
      // await this.bruteForceGuard.handleLoginResult(request, false);
      throw error;
    }
  }
  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate with Google OAuth',
    description: 'Login or register using Google OAuth token',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: 'Google OAuth token',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully authenticated with Google',
    schema: {
      example: {
        accessToken: 'jwt-token',
        user: {
          id: 'user-uuid',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid Google token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid Google token',
      },
    },
  })
  @RateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 300,
    message: 'Too many requests, please try again later',
  })
  async googleAuth(@Body('token') token: string, @Req() request: Request) {
    const payload = await this.googleAuthSecurityService.verifyToken(
      token,
      request.ip || 'unknown',
    );
    this.logger.info(`Verified Google token for email: ${payload.email}`);
    return this.authService.handleGoogleUser(payload);
  }
}
