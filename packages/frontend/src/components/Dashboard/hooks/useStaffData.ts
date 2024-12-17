// hooks/useStaffData.ts
import { skillsApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';
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

  const {
    data: metrics,
    error: metricsError,
    isLoading: metricsLoading,
  } = useQuery<UserMetrics>(
    skillsApi,
    email ? `skills-matrix/user/summary?email=${encodeURIComponent(email)}` : '',
    {
      enabled: !!email,
      requiresAuth: true,
      cacheStrategy: 'force-cache',
    },
  );

  const {
    data: skills,
    error: skillsError,
    isLoading: skillsLoading,
  } = useQuery<StaffSkills>(
    skillsApi,
    email ? `skills-matrix/user?email=${encodeURIComponent(email)}` : '',
    {
      enabled: !!email,
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
    error: metricsError || skillsError,
    loading: metricsLoading || skillsLoading,
  };
}
