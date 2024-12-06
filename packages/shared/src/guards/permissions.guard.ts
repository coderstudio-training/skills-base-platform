import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '../constants/permissions.constant';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { SecurityConfig } from '../interfaces/security.interfaces';
import { Logger } from '../services/logger.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private logger = new Logger(PermissionsGuard.name);

  constructor(
    private reflector: Reflector,
    @Inject('SECURITY_CONFIG') private readonly config: SecurityConfig,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      this.logger.debug('No API key found in request headers');
      throw new ForbiddenException('Missing API key');
    }

    const keyData = this.config.apiKey.keys.find((k) => k.key === apiKey);

    if (!keyData) {
      this.logger.debug('Invalid API key');
      throw new ForbiddenException('Invalid API key');
    }

    if (!keyData.permissions?.length) {
      throw new ForbiddenException('API key has no permissions');
    }

    const hasPermission = this.validatePermissions(
      requiredPermissions,
      keyData.permissions,
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }

  private validatePermissions(
    required: Permission[],
    available: Permission[],
  ): boolean {
    return required.every((permission) => available.includes(permission));
  }
}
