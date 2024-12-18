import { skillsApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';
import { FetchOptions } from '@/lib/api/types';

export function useAdminAnalytics() {
  const options: FetchOptions = {
    cache: 'force-cache',
  };

  const { data: analysisData } = useQuery(skillsApi, '/skills-matrix/admin/analysis', options);

  return analysisData;
}
