import { skillsApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';
import { TeamData } from '../types';

export default function useTeamSkills(name: string) {
  const {
    data: teamSkills,
    error: teamSkillsError,
    isLoading: teamSkillsLoading,
  } = useQuery<TeamData>(
    skillsApi,
    name ? `skills-matrix/manager/${encodeURIComponent(name)}` : '',
    {
      enabled: !!name,
      requiresAuth: true,
      revalidate: 3600,
    },
  );

  return {
    teamSkills,
    error: teamSkillsError,
    loading: teamSkillsLoading,
  };
}
