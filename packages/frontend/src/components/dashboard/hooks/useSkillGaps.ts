import { SkillGap } from '@/components/dashboard/types';
import { skillsApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';

interface SkillGapsResponse {
  skillGaps: SkillGap[];
}

export function useSkillGaps() {
  const {
    data,
    error,
    isLoading: loading,
  } = useQuery<SkillGapsResponse>(skillsApi, '/api/skills/analytics', {
    revalidate: 3600,
  });

  return {
    skillGaps: data?.skillGaps || [],
    loading,
    error,
  };
}
