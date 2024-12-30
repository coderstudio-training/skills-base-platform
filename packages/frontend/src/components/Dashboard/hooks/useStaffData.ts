// hooks/useStaffData.ts
import { skillsApi } from '@/lib/api/client';
import { useSuspenseQuery } from '@/lib/api/hooks';
import { Permission } from '@/lib/api/types';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { StaffData, StaffSkills, UserMetrics } from '../types';

export function useStaffData(email: string, hasPermission: (permission: Permission) => boolean) {
  const [selectedCategory, setSelectedCategory] = useState<'Technical Skills' | 'Soft Skills'>(
    'Technical Skills',
  );
  const { data: session, status } = useSession();

  const metrics = useSuspenseQuery<UserMetrics>(
    skillsApi,
    email ? `skills-matrix/user/summary?email=${encodeURIComponent(email)}` : '',
    {
      requiresAuth: true,
      enabled: hasPermission('canViewSkills'),
    },
  );

  const skills = useSuspenseQuery<StaffSkills>(
    skillsApi,
    email ? `skills-matrix/user?email=${encodeURIComponent(email)}` : '',
    {
      requiresAuth: true,
      enabled: hasPermission('canViewSkills'),
    },
  );

  const getCategoryMetrics = () => {
    if (!metrics) return null;
    return selectedCategory === 'Technical Skills' ? metrics.technicalSkills : metrics.softSkills;
  };

  const categoryMetrics = getCategoryMetrics();

  const skillsData: StaffData | null =
    metrics && skills
      ? {
          metrics,
          skills: skills.skills ?? [],
        }
      : null;

  return {
    session,
    status,
    skillsData,
    categoryMetrics,
    selectedCategory,
    setSelectedCategory,
  };
}
