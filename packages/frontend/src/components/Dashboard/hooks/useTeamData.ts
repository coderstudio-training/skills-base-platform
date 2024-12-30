import { TeamMember } from '@/components/Dashboard/types';
import { userApi } from '@/lib/api/client';
import { useAuth, useQuery } from '@/lib/api/hooks';

export function useTeamData(managerName: string) {
  const { hasPermission } = useAuth();

  const { data } = useQuery<TeamMember[]>(
    userApi,
    `/employees/manager/${encodeURIComponent(managerName)}`,
    {
      requiresAuth: true,
      enabled: hasPermission('canManageTeam'),
      cacheStrategy: 'force-cache',
    },
  );

  return {
    teamMembers: data || [],
  };
}
