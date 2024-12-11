import { skillsApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';
import { EmployeeRankingsResponse } from '../types';

export function useEmployeeRankings() {
  const {
    data: rankingsData,
    error: rankingsError,
    isLoading: rankingsLoading,
  } = useQuery<EmployeeRankingsResponse>(skillsApi, 'skills-matrix/rankings', {
    requiresAuth: true,
    revalidate: 3600,
  });

  return {
    rankings: rankingsData?.rankings || [],
    error: rankingsError,
    loading: rankingsLoading,
  };
}
