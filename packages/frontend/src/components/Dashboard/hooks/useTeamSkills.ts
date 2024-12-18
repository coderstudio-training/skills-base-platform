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
      requiresAuth: true,
      cacheStrategy: 'force-cache',
      // revalidate: 100
    },
  );

  return {
    teamSkills,
    error: teamSkillsError,
    loading: teamSkillsLoading,
  };
}
