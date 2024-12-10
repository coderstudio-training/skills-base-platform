// hooks/useAdminAnalysis.ts
import { skillsApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';
import { DistributionsResponse, OrganizationSkillsAnalysis } from '../types';

export function useAdminAnalysis() {
  const {
    data: analysisData,
    error: analysisError,
    isLoading: analysisLoading,
  } = useQuery<OrganizationSkillsAnalysis>(skillsApi, 'skills-matrix/admin/analysis', {
    requiresAuth: true,
    revalidate: 3600,
  });

  const {
    data: distributionsData,
    error: distributionsError,
    isLoading: distributionsLoading,
  } = useQuery<DistributionsResponse>(skillsApi, 'skills-matrix/distributions', {
    requiresAuth: true,
    revalidate: 3600,
  });

  return {
    analysisData,
    distributionsData,
    error: analysisError || distributionsError,
    loading: analysisLoading || distributionsLoading,
  };
}
