// hooks/useStaffData.ts
import { StaffData, StaffSkills, UserMetrics } from '@/components/Dashboard/types';
import { skillsApi } from '@/lib/api/client';
import { useSuspenseQuery } from '@/lib/api/hooks';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

export function useStaffData(email: string) {
  const [selectedCategory, setSelectedCategory] = useState<'Technical Skills' | 'Soft Skills'>(
    'Technical Skills',
  );
  const { data: session, status } = useSession();

  const metrics = useSuspenseQuery<UserMetrics>(
    skillsApi,
    email ? `skills-matrix/user/summary?email=${encodeURIComponent(email)}` : '',
    {
      requiresAuth: true,
      cacheStrategy: 'force-cache',
    },
  );

  const skills = useSuspenseQuery<StaffSkills>(
    skillsApi,
    email ? `skills-matrix/user?email=${encodeURIComponent(email)}` : '',
    {
      requiresAuth: true,
      cacheStrategy: 'force-cache',
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
