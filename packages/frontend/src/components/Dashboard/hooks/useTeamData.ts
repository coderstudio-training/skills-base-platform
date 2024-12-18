import { TeamMember } from '@/components/Dashboard/types';
import { userApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';

export function useTeamData(managerName: string) {
  const {
    data,
    error = null,
    isLoading: loading,
    refetch,
  } = useQuery<TeamMember[]>(
    userApi,
    `/employees/manager/${encodeURIComponent(managerName || '')}`,
    {
      enabled: !!managerName,
      cacheStrategy: 'force-cache',
    },
  );

  return {
    teamMembers: data || [],
    loading,
    error,
    refetchTeam: refetch,
  };
}
