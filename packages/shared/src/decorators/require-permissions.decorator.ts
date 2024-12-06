import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { Permission } from '../constants/permissions.constant';
import { PermissionsGuard } from '../guards/permissions.guard';

export const PERMISSIONS_KEY = 'permissions';

export function RequirePermissions(...permissions: Permission[]) {
  return applyDecorators(
    SetMetadata(PERMISSIONS_KEY, permissions),
    UseGuards(PermissionsGuard),
  );
}
