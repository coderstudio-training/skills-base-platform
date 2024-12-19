import { UserProfile } from '@/components/Dashboard/types';
import { userApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';

export function useUserProfile() {
  const {
    data: userProfile,
    error,
    isLoading,
  } = useQuery<UserProfile>(userApi, '/users/profile', {
    requiresAuth: true,
    cacheStrategy: 'force-cache',
  });

  const isManager = userProfile?.roles?.includes('manager');
  const fullName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Loading...';

  return {
    userProfile,
    isLoading,
    error,
    isManager,
    fullName,
  };
}
