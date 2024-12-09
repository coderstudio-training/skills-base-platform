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
}
