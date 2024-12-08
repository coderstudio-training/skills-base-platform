import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Permission } from '@skills-base/shared';
import * as crypto from 'crypto';
import { Model } from 'mongoose';
import { PermissionKey } from './entities/permission.schema';

@Injectable()
export class PermissionEncryptionService implements OnModuleInit {
  private readonly algorithm = 'chacha20-poly1305';
  private readonly nonceLength = 12;
  private readonly tagLength = 16;
  private readonly keyCache = new Map<Permission, Buffer>();
  private readonly packageKeyCache: Buffer;

  constructor(
    @InjectModel(PermissionKey.name)
    private permissionKeyModel: Model<PermissionKey>,
  ) {
    this.packageKeyCache = this.derivePackageKey();
  }

  async onModuleInit() {
    await this.preloadKeys();
  }

  private async preloadKeys(): Promise<void> {
    // Load all keys in a single query
    const activeKeys = await this.permissionKeyModel
      .find({ active: true })
      .lean()
      .exec();

    // Pre-allocate buffers for all keys
    activeKeys.forEach((keyDoc) => {
      this.keyCache.set(keyDoc.permission, Buffer.from(keyDoc.key, 'hex'));
    });
  }

  async encryptPermission(permission: Permission): Promise<string> {
    const key = await this.generateKeyForPermission(permission);

    // Pre-allocate buffers
    const nonce = crypto.randomBytes(this.nonceLength);
    const cipher = crypto.createCipheriv(this.algorithm, key, nonce, {
      authTagLength: this.tagLength,
    });

    const encrypted = Buffer.concat([
      cipher.update(permission, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    // Fast component creation
    const packageNonce = crypto.randomBytes(this.nonceLength);
    const packageCipher = crypto.createCipheriv(
      this.algorithm,
      this.packageKeyCache,
      packageNonce,
      { authTagLength: this.tagLength },
    );

    const components = {
      k: key.toString('base64'),
      n: nonce.toString('base64'),
      c: encrypted.toString('base64'),
      t: tag.toString('base64'),
    };

    const data = Buffer.from(JSON.stringify(components));
    const packageEncrypted = Buffer.concat([
      packageCipher.update(data),
      packageCipher.final(),
    ]);
    const packageTag = packageCipher.getAuthTag();

    // Fast string concatenation
    return (
      packageNonce.toString('base64') +
      '.' +
      packageTag.toString('base64') +
      '.' +
      packageEncrypted.toString('base64')
    );
  }

  public async generateKeyForPermission(
    permission: Permission,
  ): Promise<Buffer> {
    let key = this.keyCache.get(permission);
    if (!key) {
      key = crypto.randomBytes(32);
      await this.updatePermissionKey(permission, key);
      this.keyCache.set(permission, key);
    }
    return key;
  }

  private async updatePermissionKey(
    permission: Permission,
    key: Buffer,
  ): Promise<void> {
    const keyId = crypto.randomUUID();

    // Use updateOne instead of updateMany for better performance
    await this.permissionKeyModel.updateOne(
      { permission },
      {
        $set: {
          active: false,
        },
      },
    );

    await this.permissionKeyModel.create({
      permission,
      keyId,
      key: key.toString('hex'),
      active: true,
    });
  }

  private derivePackageKey(): Buffer {
    const secret = process.env.PERMISSION_PACKAGE_SECRET || 'your-secret-key';
    return crypto.scryptSync(secret, 'salt', 32);
  }

  // Optimized batch encryption
  async encryptPermissions(permissions: Permission[]): Promise<string[]> {
    // Pre-allocate result array
    const result = new Array<string>(permissions.length);

    // Process in microbatches
    const batchSize = 5;
    for (let i = 0; i < permissions.length; i += batchSize) {
      const end = Math.min(i + batchSize, permissions.length);
      const promises = permissions.slice(i, end).map((permission, index) => {
        return this.encryptPermission(permission).then((encrypted) => {
          result[i + index] = encrypted;
        });
      });
      await Promise.all(promises);
    }

    return result;
  }
}
