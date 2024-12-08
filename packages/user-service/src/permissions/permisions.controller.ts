import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Permission, PermissionDecryptionService } from '@skills-base/shared';
import { PermissionEncryptionService } from './permission-encryption.service';

@Controller('permissions')
export class PermissionController {
  constructor(
    private readonly encryptionService: PermissionEncryptionService,
    private readonly decryptionService: PermissionDecryptionService,
  ) {}

  @Get()
  getAllPermissions() {
    return Object.values(Permission);
  }

  @Post('encrypt')
  async encryptPermissions(@Body('permissions') permissions: Permission[]) {
    return this.encryptionService.encryptPermissions(permissions);
  }

  @Post('decrypt')
  async decryptPermissions(
    @Body('encryptedPermissions') encryptedPermissions: string[],
  ) {
    return this.decryptionService.decryptPermissions(encryptedPermissions);
  }

  @Post('rotate/:permission')
  async rotatePermissionKey(@Param('permission') permission: Permission) {
    await this.encryptionService.generateKeyForPermission(permission);
    return { message: `Key rotated for: ${permission}` };
  }

  @Get('test/:permission')
  async testPermissionEncryption(@Param('permission') permission: Permission) {
    const encrypted =
      await this.encryptionService.encryptPermission(permission);
    const decrypted = this.decryptionService.decryptPermission(encrypted);

    return {
      original: permission,
      encrypted,
      decrypted,
      valid: permission === decrypted,
    };
  }
}
