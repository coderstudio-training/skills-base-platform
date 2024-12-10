import { BusinessUnitStat } from '@/blocks/Dashboard/types';
import { userApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';

interface BusinessUnitsResponse {
  distribution: BusinessUnitStat[];
}

export function useBusinessUnits() {
  const { data, error } = useQuery<BusinessUnitsResponse>(userApi, '/employees/business-units', {
    revalidate: 3600,
  });

  return {
    distribution: data?.distribution || [],
    error,
  };
}
