import { TeamMember } from '@/components/Dashboard/types';
import { userApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';
import { useSession } from 'next-auth/react';

export function useTeamData() {
  const { data: session } = useSession();
  const managerName = session?.user?.name;

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
    session,
    teamMembers: data || [],
    loading,
    error,
    refetchTeam: refetch,
  };
}
