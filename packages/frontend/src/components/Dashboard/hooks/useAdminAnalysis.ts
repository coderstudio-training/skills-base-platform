import { skillsApi } from '@/lib/api/client';
import { useAuth, useQuery } from '@/lib/api/hooks';
import { DistributionsResponse, OrganizationSkillsAnalysis } from '../types';

export function useAdminAnalysis() {
  const { hasPermission } = useAuth();
  const {
    data: analysisData,
    error: analysisError,
    isLoading: analysisLoading,
  } = useQuery<OrganizationSkillsAnalysis>(skillsApi, 'skills-matrix/admin/analysis', {
    requiresAuth: true,
    cacheStrategy: 'force-cache',
    enabled: hasPermission('canViewReports'),
  });

  const {
    data: distributionsData,
    error: distributionsError,
    isLoading: distributionsLoading,
  } = useQuery<DistributionsResponse>(skillsApi, 'skills-matrix/distributions', {
    requiresAuth: true,
    cacheStrategy: 'force-cache',
    enabled: hasPermission('canViewReports'),
  });

  // Add debug logging to help identify where the error might be occurring
  console.log({
    analysisData,
    distributionsData,
    analysisError,
    distributionsError,
    analysisLoading,
    distributionsLoading,
  });

  return {
    analysisData,
    distributionsData,
    error: analysisError || distributionsError,
    loading: analysisLoading || distributionsLoading,
  };
}
