export function maskSensitiveData(data: any, sensitiveKeys: string[]): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const masked: { [key: string]: any } = Array.isArray(data) ? [] : {};
  for (const [key, value] of Object.entries(data)) {
    if (sensitiveKeys.includes(key.toLowerCase())) {
      masked[key] = '******';
    } else if (typeof value === 'object' && value !== null) {
      masked[key] = maskSensitiveData(value, sensitiveKeys);
    } else {
      masked[key] = value;
    }
  }

  return masked;
}
