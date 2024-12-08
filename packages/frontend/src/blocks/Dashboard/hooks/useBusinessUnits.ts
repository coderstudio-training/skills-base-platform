import { BusinessUnitsResponse } from '@/blocks/Dashboard/types';
import { userApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';

export function useBusinessUnits() {
  const {
    data,
    error,
    isLoading: loading,
  } = useQuery<BusinessUnitsResponse>(userApi, '/employees/business-units', {
    revalidate: 3600,
  });

  return {
    distribution: data?.distribution || [],
    loading,
    error,
  };
}
