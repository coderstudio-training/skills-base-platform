import { UserProfile } from '@/components/Dashboard/types';
import { userApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';
import { useSession } from 'next-auth/react';

export function useUserProfile() {
  const { data: session } = useSession();
  const {
    data: userProfile,
    error,
    isLoading,
  } = useQuery<UserProfile>(userApi, '/users/profile', {
    enabled: !!session?.user?.email,
    revalidate: 300,
  });

  const isManager = session?.user.role === 'manager';
  const fullName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Loading...';

  return {
    userProfile,
    isLoading,
    error,
    isManager,
    fullName,
  };
}
