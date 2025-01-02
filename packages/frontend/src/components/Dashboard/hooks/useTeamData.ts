import { TeamMember } from '@/components/Dashboard/types';
import { userApi } from '@/lib/api/client';
import { useSuspenseQuery } from '@/lib/api/hooks';

export function useTeamData(managerName: string) {
  const data = useSuspenseQuery<TeamMember[]>(
    userApi,
    `/employees/manager/${encodeURIComponent(managerName)}`,
    {
      requiresAuth: true,
      enabled: hasPermission('canManageTeam'),
    },
  );

  return {
    teamMembers: data || [],
  };
}
