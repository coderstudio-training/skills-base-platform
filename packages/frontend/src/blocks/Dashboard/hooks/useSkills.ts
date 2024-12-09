import { skillsApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';
import { SkillSummaryResponse, SkillsResponse, UserMetrics } from '../types';

export function useSkillsSummary(email: string | undefined) {
  return useQuery<UserMetrics>(
    skillsApi,
    email ? `skills-matrix/user/summary?email=${encodeURIComponent(email)}` : '',
    {
      enabled: !!email,
      requiresAuth: true,
      revalidate: 3600,
    },
  );
}

export function useSkill(email: string | undefined) {
  return useQuery<SkillsResponse>(
    skillsApi,
    email ? `skills-matrix/user?email=${encodeURIComponent(email)}` : '',
    {
      enabled: !!email,
      requiresAuth: true,
      revalidate: 3600,
    },
  );
}

export function useSkillsData(email: string | undefined) {
  const {
    data: metricsData,
    error: metricsError,
    isLoading: isLoadingMetrics,
  } = useSkillsSummary(email);

  const { data: skillsData, error: skillsError, isLoading: isLoadingSkills } = useSkill(email);

  const combinedData: SkillSummaryResponse | null =
    metricsData && skillsData
      ? {
          metrics: metricsData,
          skills: skillsData.skills,
        }
      : null;

  return {
    data: combinedData,
    error: metricsError || skillsError,
    isLoading: isLoadingMetrics || isLoadingSkills,
  };
}
