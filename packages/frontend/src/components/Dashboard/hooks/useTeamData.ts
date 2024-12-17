import { TeamMember } from '@/components/Dashboard/types';
import { userApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';
import { useSession } from 'next-auth/react';

export function useTeamData() {
  const { data: session } = useSession();
  const managerName = session?.user.name || '';

  const {
    data,
    error = null,
    isLoading: loading,
  } = useQuery<TeamMember[]>(userApi, `/employees/manager/${encodeURIComponent(managerName)}`, {
    cacheStrategy: 'force-cache',
    requiresAuth: true,
  });

  return {
    session,
    teamMembers: data || [],
    loading,
    error,
  };
}
