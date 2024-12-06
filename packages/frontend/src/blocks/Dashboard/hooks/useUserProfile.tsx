import { userApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';
import { useSession } from 'next-auth/react';

export interface UserProfile {
  firstName: string;
  lastName: string;
  designation: string;
  businessUnit: string;
  grade: string;
  roles: string[];
  picture?: string;
}

export function useUserProfile() {
  const { data: session } = useSession();
  const {
    data: userProfile,
    error,
    isLoading,
  } = useQuery<UserProfile>(userApi, '/users/profile', {
    enabled: !!session?.user?.email,
    revalidate: 3600,
  });

  const isManager = userProfile?.roles?.includes('manager');
  const fullName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Loading...';

  const getInitials = (name: string = '') => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return {
    userProfile,
    isLoading,
    error,
    isManager,
    fullName,
    getInitials,
  };
}
