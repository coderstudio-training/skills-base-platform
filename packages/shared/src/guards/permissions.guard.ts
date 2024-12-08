import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '../constants/permissions.constant';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { PermissionDecryptionService } from '../services/permission-decryption.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);
  private readonly permissionCache = new Map<string, Permission[]>();
  private readonly cacheTTL = 60000; // 1 minute cache

  constructor(
    private readonly reflector: Reflector,
    private readonly decryptionService: PermissionDecryptionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.permissions?.length) {
      throw new UnauthorizedException('No permissions found');
    }

    try {
      // Check memory cache first
      const cacheKey = this.getCacheKey(user);
      let userPermissions = this.permissionCache.get(cacheKey);

      if (!userPermissions) {
        // Process permissions in parallel with minimal batch size
        userPermissions = await this.decryptionService.decryptPermissions(
          user.permissions,
        );

        // Update cache
        this.permissionCache.set(cacheKey, userPermissions);
        setTimeout(() => this.permissionCache.delete(cacheKey), this.cacheTTL);
      }

      // Fast permission check using Set
      const permissionSet = new Set(userPermissions);
      const hasAllPermissions = requiredPermissions.every((p) =>
        permissionSet.has(p),
      );

      if (!hasAllPermissions) {
        const missing = requiredPermissions.filter(
          (p) => !permissionSet.has(p),
        );
        throw new ForbiddenException(
          `Missing permissions: ${missing.join(', ')}`,
        );
      }

      // Store decoded permissions for downstream use
      request.user.decodedPermissions = userPermissions;
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('Permission validation failed');
    }
  }

  private getCacheKey(user: any): string {
    return `${user.id}:${user.permissions.join(',')}`;
  }
}
