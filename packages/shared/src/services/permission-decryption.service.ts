import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { Permission } from '../constants/permissions.constant';

@Injectable()
export class PermissionDecryptionService {
  private readonly algorithm = 'chacha20-poly1305';
  private readonly tagLength = 16;
  private readonly packageKeyCache: Buffer;

  constructor() {
    // Pre-compute package key on service init
    this.packageKeyCache = this.derivePackageKey();
  }

  // Fast path for single permission decryption
  decryptPermission(encryptedData: string): Permission {
    const [packageNonce, tag, encrypted] = encryptedData.split('.');

    // Direct buffer allocation for better performance
    const packageNonceBuf = Buffer.from(packageNonce, 'base64');
    const tagBuf = Buffer.from(tag, 'base64');
    const encryptedBuf = Buffer.from(encrypted, 'base64');

    // Decrypt outer layer
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.packageKeyCache,
      packageNonceBuf,
      { authTagLength: this.tagLength },
    );

    decipher.setAuthTag(tagBuf);

    const componentsStr = Buffer.concat([
      decipher.update(encryptedBuf),
      decipher.final(),
    ]).toString('utf8');

    const components = JSON.parse(componentsStr);

    // Decrypt inner layer
    const innerDecipher = crypto.createDecipheriv(
      this.algorithm,
      Buffer.from(components.k, 'base64'),
      Buffer.from(components.n, 'base64'),
      { authTagLength: this.tagLength },
    );

    innerDecipher.setAuthTag(Buffer.from(components.t, 'base64'));

    const decrypted = Buffer.concat([
      innerDecipher.update(Buffer.from(components.c, 'base64')),
      innerDecipher.final(),
    ]).toString('utf8');

    return decrypted as Permission;
  }

  // Optimized batch decryption
  async decryptPermissions(
    encryptedPermissions: string[],
  ): Promise<Permission[]> {
    // Pre-allocate result array
    const result = new Array<Permission>(encryptedPermissions.length);

    // Process in microbatches for better CPU utilization
    const batchSize = 5;
    for (let i = 0; i < encryptedPermissions.length; i += batchSize) {
      const end = Math.min(i + batchSize, encryptedPermissions.length);
      const promises = encryptedPermissions
        .slice(i, end)
        .map((encrypted, index) => {
          return new Promise<void>((resolve) => {
            try {
              result[i + index] = this.decryptPermission(encrypted);
            } catch (error) {
              // Log error but don't fail the batch
              console.error(
                `Failed to decrypt permission at index ${i + index}:`,
                error,
              );
            }
            resolve();
          });
        });
      await Promise.all(promises);
    }

    // Filter out any failed decryptions
    return result.filter((p): p is Permission => p !== undefined);
  }

  private derivePackageKey(): Buffer {
    const secret = process.env.PERMISSION_PACKAGE_SECRET || 'your-secret-key';
    return crypto.scryptSync(secret, 'salt', 32);
  }
}
