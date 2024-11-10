import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  Inject,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import {
  RateLimit,
  TransformInterceptor,
  SecurityMonitor,
  SecurityConfig,
} from '@skills-base/shared';

@Controller('auth')
@UseInterceptors(TransformInterceptor)
export class AuthController {
  constructor(
    private authService: AuthService,
    private securityMonitor: SecurityMonitor,
    @Inject('SECURITY_CONFIG') private securityConfig: SecurityConfig,
  ) {}

  @Post('register')
  @RateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: 'Too many registration attempts, please try again later',
  })
  async register(@Body() registerDto: RegisterDto) {
    try {
      const result = await this.authService.register(registerDto);

      return result;
    } catch (error) {
      this.securityMonitor.logSecurityViolation('registration_failed', {
        email: registerDto.email,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @RateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts, please try again later',
  })
  async login(@Body() loginDto: LoginDto) {
    try {
      const result = await this.authService.login(loginDto);

      return result;
    } catch (error) {
      this.securityMonitor.logSecurityViolation('login_failed', {
        email: loginDto.email,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @RateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: 'Too many OAuth attempts, please try again later',
  })
  async googleAuth(@Body('token') token: string) {
    try {
      const result = await this.authService.verifyGoogleToken(token);

      return result;
    } catch (error) {
      this.securityMonitor.logSecurityViolation('google_auth_failed', {
        error: (error as Error).message,
      });
      throw error;
    }
  }
}
