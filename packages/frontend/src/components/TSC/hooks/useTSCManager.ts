import { skillsApi } from '@/lib/api/client';
import { useMutation, useQuery } from '@/lib/api/hooks';
import { IBulkUpsertDTO } from '@/lib/skills/types';
import type { BusinessUnit, TSC } from '../types';

export function useTSCManager(businessUnit: BusinessUnit) {
  const TAXONOMY_BASE_URL = '/taxonomy';

  const { data, error, isLoading, refetch } = useQuery<TSC[]>(
    skillsApi,
    `${TAXONOMY_BASE_URL}?businessUnit=${businessUnit}`,
    {
      requiresAuth: true,
      revalidate: 3600,
    },
  );

  // WIP
  const { mutate: createTSC, isLoading: isCreating } = useMutation<TSC, IBulkUpsertDTO>(
    skillsApi,
    '/tscs',
    'POST',
  );

  // WIP
  const { mutate: updateTSC, isLoading: isUpdating } = useMutation<TSC, Partial<TSC>>(
    skillsApi,
    '/tscs',
    'PUT',
  );

  // WIP
  const { mutate: deleteTSC, isLoading: isDeleting } = useMutation<void, string>(
    skillsApi,
    '/tscs',
    'DELETE',
  );

  return {
    data: data?.filter(tsc => (businessUnit === 'ALL' ? true : tsc.businessUnit === businessUnit)),
    error,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    createTSC,
    updateTSC,
    deleteTSC,
    refetch,
  };
}
