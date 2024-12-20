import { learningApi } from '@/lib/api/client';
import { useAuth, useQuery } from '@/lib/api/hooks';
import { useMemo } from 'react';
import type { ResourcesResponse } from '../types';

export function useResourceManagement(category?: string) {
  const { hasPermission } = useAuth();
  // Use useQuery for fetching resource stats
  const {
    data: resourceStats,
    isLoading: loading,
    error,
  } = useQuery<ResourcesResponse>(
    learningApi,
    `api/courses/resources${category ? `?category=${category}` : ''}`,
    {
      requiresAuth: true,
      // revalidate: 300, // Cache for 5 minutes
      cacheStrategy: 'force-cache',
      enabled: hasPermission('canManageSystem'),
    },
  );

  // Calculate category stats using memo
  const categoryStats = useMemo(() => {
    if (!resourceStats?.resources) return [];

    return Array.from(new Set(resourceStats.resources.map(r => r.skillCategory)))
      .sort()
      .map(category => ({
        name: category,
        totalResources: resourceStats.resources.filter(r => r.skillCategory === category).length,
        activeCourses: 0,
      }));
  }, [resourceStats]);

  return {
    loading,
    error: error?.message || null,
    categoryStats,
  };
}
