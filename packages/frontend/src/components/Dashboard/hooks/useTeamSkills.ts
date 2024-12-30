import { skillsApi } from '@/lib/api/client';
import { useAuth, useQuery } from '@/lib/api/hooks';
import { TeamData } from '../types';

export default function useTeamSkills(name: string) {
  const { hasPermission } = useAuth();

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
      cacheStrategy: 'force-cache',
    },
  );

  return {
    teamSkills,
    error: teamSkillsError,
    loading: teamSkillsLoading,
  };
}
