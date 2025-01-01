import { EmployeeRankingsResponse } from '@/components/Dashboard/types';
import { skillsApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';

export function useEmployeeRankings() {
  const {
    data: rankingsData,
    error: rankingsError,
    isLoading: rankingsLoading,
  } = useQuery<EmployeeRankingsResponse>(skillsApi, 'skills-matrix/rankings', {
    requiresAuth: true,
    revalidate: 300,
  });

  return {
    rankings: rankingsData?.rankings || [],
    error: rankingsError,
    loading: rankingsLoading,
  };
}
