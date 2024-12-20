import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../constants/roles.constant';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { SecurityConfig } from '../interfaces/security.interfaces';
import { Logger } from '../services/logger.service';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(
    private readonly reflector: Reflector,
    @Inject('SECURITY_CONFIG')
    private readonly config: SecurityConfig,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !Array.isArray(user.roles)) {
      this.logger.warn('Invalid user object or roles array');
      throw new UnauthorizedException('Invalid user object');
    }

    const hasRequiredRole = requiredRoles.some((requiredRole) => {
      const normalizedRequiredRole = requiredRole.toLowerCase();
      const userHasRole = user.roles.some(
        (userRole: UserRole) =>
          userRole.toLowerCase() === normalizedRequiredRole,
      );
      return userHasRole;
    });

    if (user.roles.includes(UserRole.ADMIN)) {
      const isAdmin = user.email === this.config.adminEmail;
      return isAdmin && hasRequiredRole;
    }

    return hasRequiredRole;
  }
}
