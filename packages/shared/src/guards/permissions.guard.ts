import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '../constants/permissions.constant';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { PermissionContext } from '../interfaces/permissions.inteface';
import { Logger } from '../services/logger.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private logger = new Logger(PermissionsGuard.name);
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    this.logger.debug(
      `Checking permissions for user with ID ${user?.id} and permissions: ${user?.permissions}`,
    );

    if (!user?.permissions?.length) {
      throw new ForbiddenException('User has no permissions');
    }

    // Create permission context with additional metadata
    const permContext: PermissionContext = {
      userId: user.id,
      targetId: request.params?.id,
      teamId: user.teamId,
      permissions: user.permissions,
    };

    this.logger.debug(
      `User with ID ${permContext.userId} has permissions: ${permContext.permissions}`,
    );

    const hasPermission = this.validatePermissions(
      requiredPermissions,
      permContext,
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }

  private validatePermissions(
    required: Permission[],
    context: PermissionContext,
  ): boolean {
    return required.every((permission) => {
      // Direct permission check
      if (context.permissions.includes(permission)) {
        return true;
      }

      // Hierarchical permission check
      if (this.hasHierarchicalPermission(permission, context)) {
        return true;
      }

      return false;
    });
  }

  private hasHierarchicalPermission(
    permission: Permission,
    context: PermissionContext,
  ): boolean {
    // Example hierarchical checks
    switch (permission) {
      case Permission.EDIT_TEAM_SKILLS:
        return context.permissions.includes(Permission.EDIT_ALL_SKILLS);
      case Permission.EDIT_OWN_SKILLS:
        return (
          context.permissions.includes(Permission.EDIT_TEAM_SKILLS) ||
          context.permissions.includes(Permission.EDIT_ALL_SKILLS)
        );
      // Add other hierarchical cases
      default:
        return false;
    }
  }
}
