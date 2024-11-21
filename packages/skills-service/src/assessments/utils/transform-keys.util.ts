interface SkillMap {
  [key: string]: number | SkillMap;
}

export function transformToReadableKeys<T extends SkillMap>(
  obj: T | null | undefined,
): Record<string, number> {
  if (!obj) return {};

  const transformedObj: Record<string, number> = {};

  for (const [key, value] of Object.entries(obj)) {
    const readableKey = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Handle nested objects by merging their transformed key-value pairs
      const nestedTransformed = transformToReadableKeys(value as SkillMap);
      Object.entries(nestedTransformed).forEach(([nestedKey, nestedValue]) => {
        transformedObj[`${readableKey} ${nestedKey}`] = nestedValue;
      });
    } else {
      // For non-object values, directly assign the number
      transformedObj[readableKey] = value as number;
    }
  }

  return transformedObj;
}
