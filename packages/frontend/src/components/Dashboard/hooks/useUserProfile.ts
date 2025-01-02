import { UserProfile } from '@/components/Dashboard/types';
import { userApi } from '@/lib/api/client';
import { useAuth, useQuery } from '@/lib/api/hooks';

export function useUserProfile() {
  const { hasPermission } = useAuth();

  const {
    data: userProfile,
    error,
    isLoading,
  } = useQuery<UserProfile>(userApi, '/users/profile', {
    requiresAuth: true,
    enabled: hasPermission('canViewDashboard'),
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
