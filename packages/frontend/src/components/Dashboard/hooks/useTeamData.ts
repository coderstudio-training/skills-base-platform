import { TeamMember } from '@/components/Dashboard/types';
import { userApi } from '@/lib/api/client';
import { useSuspenseQuery } from '@/lib/api/hooks';
import { useSession } from 'next-auth/react';

export function useTeamData() {
  const { data: session } = useSession();
  const managerName = session?.user?.name;

  const data = useSuspenseQuery<TeamMember[]>(
    userApi,
    `/employees/manager/${encodeURIComponent(managerName || '')}`,
    {
      requiresAuth: true,
      revalidate: 300,
    },
  );

  return {
    session,
    teamMembers: data || [],
  };
}
