// src/auth/auth.service.ts
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Logger, TrackMetric, UserRole } from '@skills-base/shared';
import * as bcrypt from 'bcrypt';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { EmployeesService } from '../employees/employees.service';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;
  private readonly logger: Logger;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private employeeService: EmployeesService,
  ) {
    this.logger = new Logger('AuthService');
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      this.logger.error('Google Client ID is not defined');
      throw new InternalServerErrorException('Google Client ID is not defined');
    }
    this.googleClient = new OAuth2Client(clientId);
  }

  @TrackMetric({ eventType: 'user_registration' })
  async register(registerDto: RegisterDto) {
    const { email, password, ...rest } = registerDto;

    try {
      this.logger.info('Attempting user registration', { email });

      const existingUser = await this.usersService.findByEmail(email);
      if (existingUser) {
        this.logger.warn('Registration failed - email already exists', {
          email,
        });
        throw new ConflictException('User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await this.usersService.create({
        ...rest,
        email,
        password: hashedPassword,
      });

      this.logger.info('User registered successfully', {
        userId: newUser.id,
        email: newUser.email,
      });

      const payload = {
        email: newUser.email,
        sub: newUser.id,
        roles: newUser.roles,
      };

      return {
        access_token: this.jwtService.sign(payload),
        roles: newUser.roles,
      };
    } catch (error) {
      this.logger.error('Registration error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email,
      });
      throw error;
    }
  }

  @TrackMetric({ eventType: 'user_login' })
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    try {
      this.logger.info('Attempting user login', { email });

      const user = await this.usersService.findByEmail(email);
      if (!user) {
        this.logger.warn('Login failed - user not found', { email });
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.password) {
        this.logger.warn('Login failed - Google OAuth account', { email });
        throw new UnauthorizedException(
          'This account uses Google OAuth. Please sign in with Google.',
        );
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        this.logger.warn('Login failed - invalid password', { email });
        throw new UnauthorizedException('Invalid credentials');
      }

      this.logger.info('User logged in successfully', {
        userId: user.id,
        email: user.email,
      });

      const payload = { email: user.email, sub: user.id, roles: user.roles };
      return {
        access_token: this.jwtService.sign(payload),
        roles: user.roles,
      };
    } catch (error) {
      this.logger.error('Login error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email,
      });
      throw error;
    }
  }

  @TrackMetric({ eventType: 'google_auth' })
  async verifyGoogleToken(token: string) {
    try {
      this.logger.info('Verifying Google token');

      const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
      if (!clientId) {
        this.logger.error('Google Client ID is not defined');
        throw new InternalServerErrorException(
          'Google Client ID is not defined',
        );
      }

      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: clientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        this.logger.error('Invalid Google token: payload is null');
        throw new UnauthorizedException('Invalid Google token');
      }

      return this.handleGoogleUser(payload);
    } catch (error) {
      this.logger.error('Google token verification error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  private async handleGoogleUser(payload: TokenPayload) {
    const { email, sub: googleId, given_name, family_name, picture } = payload;

    if (!email) {
      this.logger.error('Email not provided in Google token');
      throw new UnauthorizedException('Email not provided in Google token');
    }

    try {
      this.logger.info('Processing Google user', { email });

      let user = await this.usersService.findByEmail(email);
      const employedUser = await this.employeeService.findByEmail(email);

      if (!employedUser) {
        this.logger.warn('Google auth failed - user not employed', { email });
        throw new UnauthorizedException(
          'User is not employed/registered by the company',
        );
      }

      if (!user) {
        user = await this.usersService.create({
          email,
          googleId: googleId!,
          firstName: given_name || 'Google',
          lastName: family_name || 'User',
          picture: picture || '',
          roles: [UserRole.USER],
        });
        this.logger.info('Created new user with Google OAuth', {
          userId: user.id,
          email,
        });
      } else if (!user.googleId) {
        user = await this.usersService.update(user.id, { googleId: googleId! });
        this.logger.info('Updated existing user with Google ID', {
          userId: user.id,
          email,
        });
      }

      const jwtPayload = {
        email: user.email,
        sub: user.id,
        roles: user.roles,
      };

      return {
        access_token: this.jwtService.sign(jwtPayload),
        roles: user.roles,
      };
    } catch (error) {
      this.logger.error('Google user handling error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email,
      });
      throw error;
    }
  }
}
