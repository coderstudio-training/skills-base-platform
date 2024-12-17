// hooks/useStaffData.ts
import { skillsApi } from '@/lib/api/client';
import { useSuspenseQuery } from '@/lib/api/hooks';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { StaffData, StaffSkills, UserMetrics } from '../types';

export function useStaffData() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState<'Technical Skills' | 'Soft Skills'>(
    'Technical Skills',
  );
  const { data: session, status } = useSession();
  const email = session?.user?.email;

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

  // Get category-specific metrics based on selected category
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
    activeTab,
    setActiveTab,
    selectedCategory,
    setSelectedCategory,
  };
}
