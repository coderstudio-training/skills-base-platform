import { TeamMember } from '@/components/Dashboard/types';
import { userApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';

export function useTeamData(managerName: string) {
  const { data } = useQuery<TeamMember[]>(
    userApi,
    `/employees/manager/${encodeURIComponent(managerName)}`,
    {
      requiresAuth: true,
      cacheStrategy: 'force-cache',
    },
  );

  return {
    teamMembers: data || [],
  };
}
