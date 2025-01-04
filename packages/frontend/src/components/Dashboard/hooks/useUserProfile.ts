import { UserProfile } from '@/components/Dashboard/types';
import { userApi } from '@/lib/api/client';
import { useAuth, useSuspenseQuery } from '@/lib/api/hooks';

export function useUserProfile() {
  const { hasPermission } = useAuth();

  const userProfile = useSuspenseQuery<UserProfile>(userApi, '/users/profile', {
    requiresAuth: true,
    enabled: hasPermission('canViewDashboard'),
  });

  const isManager = userProfile?.roles?.includes('manager');
  const fullName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Loading...';

  return {
    userProfile,
    isManager,
    fullName,
  };
}
