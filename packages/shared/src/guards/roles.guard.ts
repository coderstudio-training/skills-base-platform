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
    this.logger.info('User object:', user);

    if (!user || !Array.isArray(user.roles)) {
      this.logger.warn('Invalid user object or roles array');
      throw new UnauthorizedException('Invalid user object');
    }

    // Debug logging
    this.logger.info(`Required roles: ${JSON.stringify(requiredRoles)}`);
    this.logger.info(`User roles: ${JSON.stringify(user.roles)}`);

    // Case insensitive role checking
    const hasRequiredRole = requiredRoles.some((requiredRole) => {
      const normalizedRequiredRole = requiredRole.toLowerCase();
      const userHasRole = user.roles.some(
        (userRole: UserRole) =>
          userRole.toLowerCase() === normalizedRequiredRole,
      );

      this.logger.info(
        `Checking role: ${requiredRole} (normalized: ${normalizedRequiredRole}) - User has role: ${userHasRole}`,
      );

      return userHasRole;
    });

    // Admin email check (if you still want this)
    if (requiredRoles.includes(UserRole.ADMIN)) {
      const isAdmin = user.email === this.config.adminEmail;
      return isAdmin && hasRequiredRole;
    }

    return hasRequiredRole;
  }
}
