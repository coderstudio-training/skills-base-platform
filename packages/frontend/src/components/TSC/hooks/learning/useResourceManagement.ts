import { getResourceManagement } from '@/lib/api';
import type { ResourcesResponse } from '@/types/admin';
import { useEffect, useMemo, useState } from 'react';

export function useResourceManagement() {
  const [resourceStats, setResourceStats] = useState<ResourcesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResourceStats() {
      try {
        setLoading(true);
        const data = await getResourceManagement();
        setResourceStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch resource stats');
      } finally {
        setLoading(false);
      }
    }

    fetchResourceStats();
  }, []);

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
    error,
    categoryStats,
  };
}
