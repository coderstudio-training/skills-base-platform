import type { TSC } from '@/components/Dashboard/types';
import { skillsApi } from '@/lib/api/client';
import { useMutation, useQuery } from '@/lib/api/hooks';
import { IBaseTaxonomy, IBulkUpsertDTO } from '@/lib/skills/types';

export function useTSCManager() {
  const TAXONOMY_BASE_URL = '/taxonomy/technical';

  const { data, isLoading, error, refetch } = useQuery<IBaseTaxonomy[]>(
    skillsApi,
    `${TAXONOMY_BASE_URL}?businessUnit=QA`,
    {
      requiresAuth: true,
      revalidate: 300,
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
    data,
    isLoading,
    error,
    refetch,
    isCreating,
    isUpdating,
    isDeleting,
    createTSC,
    updateTSC,
    deleteTSC,
  };
}
