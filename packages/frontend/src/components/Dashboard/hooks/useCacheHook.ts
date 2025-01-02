import { skillsApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';

export function useAdminAnalytics() {
  const { data: analysisData } = useQuery(skillsApi, '/skills-matrix/admin/analysis');

  return analysisData;
}
