import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserRole } from '@skills-base/shared';
import { Model } from 'mongoose';
import { Permission } from './entities/permission.schema';
import { Roles } from './entities/roles.schema';

@Injectable()
export class PermissionsService implements OnModuleInit {
  private readonly logger = new Logger(PermissionsService.name);
  private permissionCache: Map<string, number> = new Map();

  constructor(
    @InjectModel(Permission.name)
    private permissionModel: Model<Permission>,

    @InjectModel(Roles.name)
    private roleModel: Model<Roles>,
  ) {}

  async onModuleInit() {
    await this.loadPermissionsIntoCache();
  }

  private async loadPermissionsIntoCache() {
    try {
      const permissions = await this.permissionModel.find().exec();
      this.permissionCache.clear();
      permissions.forEach((permission) => {
        this.permissionCache.set(permission.name, permission.code);
      });
      this.logger.log('Permissions loaded into cache');
    } catch (error) {
      this.logger.error('Failed to load permissions into cache:', error);
    }
  }

  async getPermissionCode(name: string): Promise<number | undefined> {
    return this.permissionCache.get(name);
  }

  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionModel.find().exec();
  }

  async getPermissionCodesForRoles(roles: UserRole[]): Promise<number[]> {
    const rolePermissions = await this.getRolePermissions(roles);
    const codes: number[] = [];

    for (const permName of rolePermissions) {
      const code = await this.getPermissionCode(permName);
      if (code) {
        codes.push(code);
      }
    }

    return [...new Set(codes)]; // Remove duplicates
  }

  private async getRolePermissions(roles: UserRole[]): Promise<string[]> {
    const rolePermissions = await Promise.all(
      roles.map(async (role) => {
        const roleDoc = await this.roleModel.findOne({ name: role }).exec();
        return roleDoc?.permissions || [];
      }),
    );

    return rolePermissions.flat();
  }
}
