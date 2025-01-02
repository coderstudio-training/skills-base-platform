import { IBaseTaxonomy } from '@/components/Dashboard/types';
import { skillsApi } from '@/lib/api/client';
import { useSuspenseQuery } from '@/lib/api/hooks';

export function useTSCManager() {
  const TAXONOMY_BASE_URL = '/taxonomy/technical';

  const data = useSuspenseQuery<IBaseTaxonomy[]>(
    skillsApi,
    `${TAXONOMY_BASE_URL}?businessUnit=QA`,
    {
      requiresAuth: true,
      revalidate: 300,
    },
  );

  return {
    data,
  };
}
