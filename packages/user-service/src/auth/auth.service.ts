import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Logger, Monitor, UserRole } from '@skills-base/shared';
import * as bcrypt from 'bcrypt';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { EmployeesService } from '../employees/employees.service';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly monitor: Monitor,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private employeeService: EmployeesService,
  ) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      this.logger.error('Missing configuration: GOOGLE_CLIENT_ID', {
        type: 'auth.config.error',
        configKey: 'GOOGLE_CLIENT_ID',
      });
      throw new InternalServerErrorException('Google Client ID is not defined');
    }
    this.googleClient = new OAuth2Client(clientId);
  }

  async register(registerDto: RegisterDto) {
    const timer = this.monitor.startTimer('auth.register');
    const { email, password, ...rest } = registerDto;

    try {
      this.logger.info('Starting user registration', {
        type: 'auth.register.start',
        email,
      });

      // Check if user exists
      const existingUser = await this.usersService.findByEmail(email);
      if (existingUser) {
        this.logger.warn('Registration failed - Email already exists', {
          type: 'auth.register.duplicate',
          email,
        });
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      this.monitor.trackMetric('auth.password.hash.duration', timer.end());

      // Create user
      const userTimer = this.monitor.startTimer('auth.user.create');
      const newUser = await this.usersService.create({
        ...rest,
        email,
        password: hashedPassword,
      });
      this.monitor.trackMetric('auth.user.create.duration', userTimer.end());

      // Generate token
      const payload = {
        email: newUser.email,
        sub: newUser.id,
        roles: newUser.roles,
      };

      const result = {
        access_token: this.jwtService.sign(payload),
        roles: newUser.roles,
      };

      this.logger.info('User registered successfully', {
        type: 'auth.register.success',
        userId: newUser.id,
        email: newUser.email,
      });

      return result;
    } catch (error) {
      await this.logger.trackException(error, {
        type: 'auth.register.error',
        email,
        errorType: error instanceof Error ? error.name : 'UnknownError',
      });
      throw error;
    } finally {
      timer.end();
    }
  }

  async login(loginDto: LoginDto) {
    const timer = this.monitor.startTimer('auth.login');
    const { email, password } = loginDto;

    try {
      this.logger.info('Processing login attempt', {
        type: 'auth.login.attempt',
        email,
      });

      // Find user
      const findTimer = this.monitor.startTimer('auth.user.find');
      const user = await this.usersService.findByEmail(email);
      this.monitor.trackMetric('auth.user.find.duration', findTimer.end());

      if (!user) {
        this.logger.warn('Login failed - User not found', {
          type: 'auth.login.notfound',
          email,
        });
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if OAuth user
      if (!user.password) {
        this.logger.warn('Login failed - OAuth user attempted password login', {
          type: 'auth.login.oauth_conflict',
          userId: user.id,
          email,
        });
        throw new UnauthorizedException(
          'This account uses Google OAuth. Please sign in with Google.',
        );
      }

      // Verify password
      const passwordTimer = this.monitor.startTimer('auth.password.verify');
      const isPasswordValid = await bcrypt.compare(password, user.password);
      this.monitor.trackMetric(
        'auth.password.verify.duration',
        passwordTimer.end(),
      );

      if (!isPasswordValid) {
        this.logger.warn('Login failed - Invalid password', {
          type: 'auth.login.invalid_password',
          userId: user.id,
          email,
        });
        this.monitor.trackMetric('auth.login.failed', 1, {
          reason: 'invalid_password',
        });
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = {
        email: user.email,
        sub: user.id,
        roles: user.roles,
      };

      const result = {
        access_token: this.jwtService.sign(payload),
        roles: user.roles,
      };

      this.logger.info('Login successful', {
        type: 'auth.login.success',
        userId: user.id,
        email: user.email,
        roles: user.roles,
      });

      this.monitor.trackMetric('auth.login.success', 1);
      return result;
    } catch (error) {
      this.monitor.trackMetric('auth.login.failed', 1, {
        reason:
          error instanceof UnauthorizedException ? 'unauthorized' : 'error',
      });

      await this.logger.trackException(error, {
        type: 'auth.login.error',
        email,
        errorType: error instanceof Error ? error.name : 'UnknownError',
      });
      throw error;
    } finally {
      timer.end();
    }
  }

  async verifyGoogleToken(token: string) {
    const timer = this.monitor.startTimer('auth.google.verify');

    try {
      this.logger.info('Verifying Google token', {
        type: 'auth.google.verify.start',
      });

      // Verify token
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload) {
        this.logger.error('Google token verification failed - No payload', {
          type: 'auth.google.verify.no_payload',
        });
        throw new UnauthorizedException('Invalid Google token');
      }

      this.logger.info('Google token verified successfully', {
        type: 'auth.google.verify.success',
        email: payload.email,
      });

      return this.handleGoogleUser(payload);
    } catch (error) {
      this.monitor.trackMetric('auth.google.verify.failed', 1);

      await this.logger.trackException(error, {
        type: 'auth.google.verify.error',
        errorType: error instanceof Error ? error.name : 'UnknownError',
      });
      throw new UnauthorizedException('Invalid Google token');
    } finally {
      timer.end();
    }
  }

  private async handleGoogleUser(payload: TokenPayload) {
    const timer = this.monitor.startTimer('auth.google.handle_user');
    const { email, sub: googleId, given_name, family_name, picture } = payload;

    if (!email) {
      this.logger.error('Google authentication failed - No email in token', {
        type: 'auth.google.no_email',
      });
      throw new UnauthorizedException('Email not provided in Google token');
    }

    try {
      // Find existing user
      const findTimer = this.monitor.startTimer('auth.user.find');
      let user = await this.usersService.findByEmail(email);
      this.monitor.trackMetric('auth.user.find.duration', findTimer.end());

      // Verify employment
      const employeeTimer = this.monitor.startTimer('auth.employee.verify');
      const employedUser = await this.employeeService.findByEmail(email);
      this.monitor.trackMetric(
        'auth.employee.verify.duration',
        employeeTimer.end(),
      );

      if (!employedUser) {
        this.logger.warn('Google authentication failed - User not employed', {
          type: 'auth.google.not_employed',
          email,
        });
        throw new UnauthorizedException(
          'User is not employed/registered by the company',
        );
      }

      // Create or update user
      if (!user) {
        const createTimer = this.monitor.startTimer('auth.user.create');
        user = await this.usersService.create({
          email,
          googleId: googleId!,
          firstName: given_name || 'Google',
          lastName: family_name || 'User',
          picture: picture || '',
          roles: [UserRole.USER],
        });
        this.monitor.trackMetric(
          'auth.user.create.duration',
          createTimer.end(),
        );

        this.logger.info('Created new user via Google OAuth', {
          type: 'auth.google.user.created',
          userId: user.id,
          email,
        });
      } else if (!user.googleId) {
        const updateTimer = this.monitor.startTimer('auth.user.update');
        user = await this.usersService.update(user.id, { googleId: googleId! });
        this.monitor.trackMetric(
          'auth.user.update.duration',
          updateTimer.end(),
        );

        this.logger.info('Updated existing user with Google ID', {
          type: 'auth.google.user.updated',
          userId: user.id,
          email,
        });
      }

      const payload = {
        email: user.email,
        sub: user.id,
        roles: user.roles,
      };

      this.logger.info('Google authentication successful', {
        type: 'auth.google.success',
        userId: user.id,
        email: user.email,
      });

      return {
        access_token: this.jwtService.sign(payload),
        roles: user.roles,
      };
    } catch (error) {
      await this.logger.trackException(error, {
        type: 'auth.google.handle_user.error',
        email,
        errorType: error instanceof Error ? error.name : 'UnknownError',
      });
      throw new InternalServerErrorException(
        'Failed to process Google authentication',
      );
    } finally {
      timer.end();
    }
  }
}
