export class StringUtils {
  static sanitizeServiceName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_') // Replace invalid chars with underscore
      .replace(/^[^a-z_]/, '_$&') // Ensure starts with letter or underscore
      .replace(/__+/g, '_') // Replace multiple underscores with single
      .replace(/^_+|_+$/g, ''); // Trim leading/trailing underscores
  }

  static validateServiceName(name: string | undefined): string {
    if (!name || typeof name !== 'string') {
      return 'unnamed_service';
    }
    return StringUtils.sanitizeServiceName(name);
  }

  static parseApiKeys(apiKeysStr: string | undefined) {
    if (!apiKeysStr) return [];

    try {
      // Try parsing as JSON first (new format)
      const keys = JSON.parse(apiKeysStr);
      console.log(
        keys.map((key: any) => ({
          key: key.key,
          name: key.name,
          permissions: key.permissions,
          isActive: key.isActive ?? true,
          expiresAt: key.expiresAt ? new Date(key.expiresAt) : undefined,
        })),
      );
      return keys.map((key: any) => ({
        key: key.key,
        name: key.name,
        permissions: key.permissions,
        isActive: key.isActive ?? true,
        expiresAt: key.expiresAt ? new Date(key.expiresAt) : undefined,
      }));
    } catch (e) {
      // Fallback to old format (comma-separated string)
      console.warn(
        'Using legacy API key format. Consider updating to the new JSON format.' +
          e,
      );
      return apiKeysStr
        .split(',')
        .filter(Boolean)
        .map((key) => ({
          key: key.trim(),
          name: `Legacy Key ${key.substring(0, 8)}...`,
          permissions: [],
          isActive: true,
        }));
    }
  }
}
