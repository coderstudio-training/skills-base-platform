export const CACHE_KEYS = {
  SOFT_SKILLS: 'skills:soft',
  ADMIN_ANALYSIS: 'analysis:admin',
  DISTRIBUTIONS: 'analysis:distributions',
  RANKINGS: 'analysis:rankings',
  CAPABILITY_ANALYSIS: (capability: string) =>
    `analysis:capability:${capability}`,
} as const;

export const CACHE_TTL = {
  SOFT_SKILLS: 24 * 3600000, // 24 hours
  ANALYSIS: 3600000, // 1 hour
} as const;
