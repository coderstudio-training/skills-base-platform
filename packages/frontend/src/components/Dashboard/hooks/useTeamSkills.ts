import { TeamData } from '@/components/Dashboard/types';
import { skillsApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';

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
      enabled: hasPermission('canViewSkills'),
    },
  );

  return {
    teamSkills,
    error: teamSkillsError,
    loading: teamSkillsLoading,
  };
}
