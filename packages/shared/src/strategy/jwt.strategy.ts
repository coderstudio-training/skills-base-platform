import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {
  PERMISSION_CODES,
  PermissionCode,
} from '../constants/permisssion-codes.constant';
import { JwtPayload } from '../interfaces/kwt-payload.interface';
import { Logger } from '../services/logger.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  private readonly validPermissionCodes: Set<PermissionCode>;

  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
      ignoreExpiration: false,
      algorithms: ['HS256'],
      issuer: 'skills-base-platform',
      audience: configService.get<string>('JWT_AUDIENCE'),
    });

    // Pre-compute valid permission codes set for faster lookups
    this.validPermissionCodes = new Set(Object.values(PERMISSION_CODES));
  }

  async validate(payload: any): Promise<JwtPayload> {
    try {
      if (!this.validateTokenStructure(payload)) {
        throw new UnauthorizedException('Invalid token structure');
      }

      if (!this.validatePermissionCodes(payload.perms)) {
        throw new UnauthorizedException('Invalid permission codes');
      }

      return {
        sub: payload.sub,
        email: payload.email,
        roles: payload.roles,
        perms: payload.perms,
        iss: payload.iss,
        aud: payload.aud,
        exp: payload.exp,
      };
    } catch (error) {
      this.logger.error(`Token validation failed: ${error.message}`, {
        email: payload.email,
        error: error.stack,
      });
      throw new UnauthorizedException('Invalid token');
    }
  }

  private validateTokenStructure(payload: any): boolean {
    const requiredFields = ['sub', 'email', 'perms', 'roles'];
    const missingFields = requiredFields.filter((field) => !payload[field]);

    if (missingFields.length > 0) {
      this.logger.warn('Missing required fields in token', {
        email: payload.email,
        missingFields,
      });
      return false;
    }

    if (!Array.isArray(payload.perms) || !Array.isArray(payload.roles)) {
      this.logger.warn('Invalid array format in token', {
        email: payload.email,
        permsType: typeof payload.perms,
        rolesType: typeof payload.roles,
      });
      return false;
    }

    return true;
  }

  private validatePermissionCodes(perms: any[]): boolean {
    const invalidCodes = perms.filter(
      (code) => !this.validPermissionCodes.has(code),
    );

    if (invalidCodes.length > 0) {
      this.logger.warn('Invalid permission codes detected', {
        invalidCodes,
        validCodes: Array.from(this.validPermissionCodes),
      });
      return false;
    }

    return true;
  }
}
