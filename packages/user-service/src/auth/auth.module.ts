// auth.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CacheModule } from '@nestjs/cache-manager';
import {
  JwtStrategy,
  SecurityMonitor,
  SecurityModule,
} from '@skills-base/shared';
import { EmployeesModule } from '../employees/employees.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    EmployeesModule,
    CacheModule.register({
      ttl: 60 * 60 * 1000, // 1 hour
      max: 100,
    }),
    SecurityModule.forFeature(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, SecurityMonitor],
  exports: [AuthService],
})
export class AuthModule {}
