// src/guards/roles.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../constants/roles.constant';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { SecurityConfig } from '../interfaces/security.interfaces';

@Injectable()
export class RolesGuard implements CanActivate {
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
    const { user } = context.switchToHttp().getRequest();

    console.log(user);
    console.log(this.config.adminEmail);

    if (requiredRoles.includes(UserRole.ADMIN)) {
      return user.email === this.config.adminEmail;
    }
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
