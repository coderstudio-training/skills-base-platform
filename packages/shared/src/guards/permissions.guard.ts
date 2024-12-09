import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  Permission,
  PERMISSION_TO_CODE,
} from '../constants/permissions.constant';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

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

    if (!user?.perms || !Array.isArray(user.perms)) {
      this.logger.warn('Invalid or missing permissions in user object', {
        userId: user?.sub,
        email: user?.email,
      });
      return false;
    }

    const hasPermissions = requiredPermissions.every((permission) => {
      const requiredCode = PERMISSION_TO_CODE[permission];
      const hasPermission = user.perms.includes(requiredCode);

      if (!hasPermission) {
        this.logger.debug(`Permission denied: ${permission}`, {
          userId: user.sub,
          email: user.email,
          requiredCode,
          userPerms: user.perms,
        });
      }

      return hasPermission;
    });

    return hasPermissions;
  }
}
