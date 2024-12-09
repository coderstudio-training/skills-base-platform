import { TopPerformersResponse } from '@/blocks/Dashboard/types';
import { skillsApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';

export function useTopPerformers() {
  const {
    data,
    error,
    isLoading: loading,
  } = useQuery<TopPerformersResponse>(skillsApi, '/api/skills/rankings', {
    revalidate: 3600,
  });

  return {
    rankings: data?.rankings.slice(0, 10) || [],
    loading,
    error,
  };
}
