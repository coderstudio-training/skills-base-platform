// packages/user-service/src/auth/auth.service.ts
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Logger, UserRole } from '@skills-base/shared';
import * as bcrypt from 'bcrypt';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { PermissionsService } from 'src/permissions/permissions.service';
import { EmployeesService } from '../employees/employees.service';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private employeeService: EmployeesService,
    private permissionsService: PermissionsService,
  ) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      this.logger.error('Google Client ID is not defined');
      throw new InternalServerErrorException('Google Client ID is not defined');
    }
    this.googleClient = new OAuth2Client(clientId);
  }

  async register(registerDto: RegisterDto) {
    const { email, password, ...rest } = registerDto;

    try {
      // Check if user already exists
      const existingUser = await this.usersService.findByEmail(email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the user
      const newUser = await this.usersService.create({
        ...rest,
        email,
        password: hashedPassword,
      });

      // Generate JWT token
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
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      // const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to register user: ${errorMessage}`);
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.password) {
        throw new UnauthorizedException(
          'This account uses Google OAuth. Please sign in with Google.',
        );
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Get permission codes from the roles
      const permissionCodes =
        await this.permissionsService.getPermissionCodesForRoles(user.roles);

      // Create JWT payload
      const payload = {
        userId: user.id, // required
        email: user.email, // required
        roles: user.roles, // required
        perms: permissionCodes, // required
        iss: 'skills-base-platform',
        aud: this.configService.get('JWT_AUDIENCE'),
      };

      return {
        access_token: this.jwtService.sign(payload),
        roles: user.roles,
      };
    } catch (error) {
      this.logger.error(`Failed to login user: ${(error as Error).message}`);
      throw error;
    }
  }

  async verifyGoogleToken(token: string) {
    try {
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
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      // const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to verify Google token: ${errorMessage}`);
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  public async handleGoogleUser(payload: TokenPayload) {
    const { email, sub: googleId, given_name, family_name, picture } = payload;

    if (!email) {
      this.logger.error('Email not provided in Google token');
      throw new UnauthorizedException('Email not provided in Google token');
    }

    try {
      let user = await this.usersService.findByEmail(email);

      const employedUser = await this.employeeService.findByEmail(email);
      if (!employedUser) {
        throw new UnauthorizedException(
          `${email} is not employed/registered by the company`,
        );
      }

      if (!user) {
        // If the user doesn't exist, create a new one
        user = await this.usersService.create({
          email,
          googleId: googleId!,
          firstName: given_name || 'Google',
          lastName: family_name || 'User',
          picture: picture || '',
          roles: [UserRole.USER], // Default role
        });
        this.logger.info(`Created new user with Google OAuth: ${email}`);
      } else if (!user.googleId) {
        // If the user exists but doesn't have a googleId, update it
        user = await this.usersService.update(user.id, { googleId: googleId! });
        this.logger.info(`Updated existing user with Google ID: ${email}`);
      }

      // Get permission codes from the roles
      const permissionCodes =
        await this.permissionsService.getPermissionCodesForRoles(user.roles);

      // Create JWT payload
      const payload = {
        userId: user.id, // required
        email: user.email, // required
        roles: user.roles, // required
        perms: permissionCodes, // required
        iss: 'skills-base-platform',
        aud: this.configService.get('JWT_AUDIENCE'),
      };

      return {
        access_token: this.jwtService.sign(payload),
        roles: user.roles,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      // const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to handle Google user: ${errorMessage}`);
      throw new InternalServerErrorException(
        'Failed to process Google authentication',
      );
    }
  }
}
