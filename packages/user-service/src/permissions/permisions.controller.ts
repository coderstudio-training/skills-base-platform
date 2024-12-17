import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  JwtAuthGuard,
  Permission,
  RedisCache,
  RequirePermissions,
  Roles,
  RolesGuard,
  UserRole,
} from '@skills-base/shared';
import { PermissionsService } from './permissions.service';

@ApiTags('permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-Admin')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @RequirePermissions(Permission.MANAGE_SYSTEM)
  @RedisCache('permissions:all', 3600) // Cache for 1 hour
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({
    status: 200,
    description: 'Returns all available permissions',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          code: { type: 'number' },
          description: { type: 'string' },
        },
      },
    },
  })
  getAllPermissions() {
    return this.permissionsService.getAllPermissions();
  }

  @Get('roles/:role')
  @Roles(UserRole.ADMIN)
  @RequirePermissions(Permission.MANAGE_SYSTEM)
  @RedisCache({
    key: 'permissions:role',
    keyGenerator: (ctx) => `permissions:role:${ctx.request.user.role}`,
    ttl: 3600,
  })
  @ApiOperation({ summary: 'Get permissions for a specific role' })
  @ApiResponse({
    status: 200,
    description: 'Returns permission codes for the specified role',
    schema: {
      type: 'array',
      items: { type: 'number' },
    },
  })
  async getRolePermissions(@Param('role') role: UserRole) {
    return this.permissionsService.getPermissionCodesForRoles([role]);
  }

  @Post('verify')
  @Roles(UserRole.ADMIN)
  @RequirePermissions(Permission.MANAGE_SYSTEM)
  @RedisCache({
    keyGenerator: (ctx) =>
      `permissions:verify:${ctx.request.body.permissionName}`,
    ttl: 3600,
  })
  @ApiOperation({ summary: 'Verify permissions' })
  @ApiResponse({
    status: 200,
    description: 'Returns verification result for permissions',
    schema: {
      type: 'object',
      properties: {
        permissionName: { type: 'string' },
        code: { type: 'number' },
        valid: { type: 'boolean' },
      },
    },
  })
  async verifyPermission(@Body('permissionName') permissionName: string) {
    const code =
      await this.permissionsService.getPermissionCode(permissionName);
    return {
      permissionName,
      code,
      valid: code !== undefined,
    };
  }

  @Get('codes/:permissionName')
  @Roles(UserRole.ADMIN)
  @RequirePermissions(Permission.MANAGE_SYSTEM)
  @RedisCache({
    keyGenerator: (ctx) =>
      `permissions:code:${ctx.request.params.permissionName}`,
    ttl: 3600,
  })
  @ApiOperation({ summary: 'Get code for specific permission' })
  @ApiResponse({
    status: 200,
    description: 'Returns the code for the specified permission',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        code: { type: 'number' },
      },
    },
  })
  async getPermissionCode(@Param('permissionName') permissionName: string) {
    const code =
      await this.permissionsService.getPermissionCode(permissionName);
    return { name: permissionName, code };
  }
}
