import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@skills-base/shared';
import { User } from '../users/entities/user.entity';
import { Types } from 'mongoose';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = (overrides: Partial<User> = {}): User => ({
    _id: new Types.ObjectId(),
    id: 'user-id',
    email: 'test@example.com',
    password: 'hashed-password',
    firstName: 'John',
    lastName: 'Doe',
    roles: [UserRole.USER],
    createdAt: new Date(),
    updatedAt: new Date(),
    googleId: undefined,
    ...overrides,
  } as User);

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    // Mock the Google OAuth client
    (service as any).googleClient = {
      verifyIdToken: jest.fn(),
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyGoogleToken', () => {
    it('should create a new user if one does not exist', async () => {
      const mockPayload = {
        email: 'test@example.com',
        sub: '123456789',
        given_name: 'John',
        family_name: 'Doe',
      };

      configService.get.mockReturnValue('mock-client-id');
      (service as any).googleClient.verifyIdToken.mockResolvedValue({
        getPayload: () => mockPayload,
      });
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser({
        email: mockPayload.email,
        googleId: mockPayload.sub,
        firstName: mockPayload.given_name,
        lastName: mockPayload.family_name,
      }));
      jwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.verifyGoogleToken('mock-token');

      expect(usersService.create).toHaveBeenCalledWith({
        email: mockPayload.email,
        googleId: mockPayload.sub,
        firstName: mockPayload.given_name,
        lastName: mockPayload.family_name,
        roles: [UserRole.USER],
      });
      expect(result).toEqual({ access_token: 'mock-jwt-token' });
    });

    it('should update an existing user if googleId is not set', async () => {
      const mockPayload = {
        email: 'test@example.com',
        sub: '123456789',
        given_name: 'John',
        family_name: 'Doe',
      };

      configService.get.mockReturnValue('mock-client-id');
      (service as any).googleClient.verifyIdToken.mockResolvedValue({
        getPayload: () => mockPayload,
      });
      usersService.findByEmail.mockResolvedValue(mockUser({ email: mockPayload.email }));
      usersService.update.mockResolvedValue(mockUser({
        email: mockPayload.email,
        googleId: mockPayload.sub,
      }));
      jwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.verifyGoogleToken('mock-token');

      expect(usersService.update).toHaveBeenCalledWith('user-id', { googleId: mockPayload.sub });
      expect(result).toEqual({ access_token: 'mock-jwt-token' });
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      configService.get.mockReturnValue('mock-client-id');
      (service as any).googleClient.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      await expect(service.verifyGoogleToken('invalid-token')).rejects.toThrow(UnauthorizedException);
    });
  });
});
