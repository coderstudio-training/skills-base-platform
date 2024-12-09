'use client';

import { EmployeeStats } from '@/blocks/Dashboard/types';
import { userApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';

export function useStatsData() {
  const {
    data: stats,
    error,
    isLoading: loading,
  } = useQuery<EmployeeStats>(userApi, '/employees/stats', {
    revalidate: 3600,
  });

  return {
    stats: stats || {
      totalEmployeesCount: 0,
      businessUnitsCount: 0,
      activeEmployeesCount: 0,
    },
    loading,
    error,
  };
}
