import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PermissionDecryptionService } from '@skills-base/shared';
import {
  PermissionKey,
  PermissionKeySchema,
} from './entities/permission.schema';
import { PermissionController } from './permisions.controller';
import { PermissionEncryptionService } from './permission-encryption.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PermissionKey.name, schema: PermissionKeySchema },
    ]),
  ],
  controllers: [PermissionController],
  providers: [PermissionEncryptionService, PermissionDecryptionService],
  exports: [PermissionEncryptionService, PermissionDecryptionService],
})
export class PermissionsModule {}
