import { skillsApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';
import { SkillSummaryResponse } from '../types';

export function useSkillsSummary() {
  return useQuery<SkillSummaryResponse>(skillsApi, 'skills-matrix/user/summary', {
    enabled: true,
    requiresAuth: true,
    revalidate: 3600, // Cache for 1 hour
  });
}
