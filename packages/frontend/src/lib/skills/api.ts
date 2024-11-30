import { skillsApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';
import { ApiClientOptions } from '@/lib/api/types';
import * as ApiTypes from '@/lib/skills/types';
import { logger } from '@/lib/utils';

const TAXONOMY_BASE_URL = '/taxonomy';

export async function getTechnicalTaxonomy(
  businessUnit: string,
  options: ApiClientOptions = { requiresAuth: true },
) {
  logger.log(`[TAXONOMY] Getting taxonomy for ${businessUnit} `);
  return skillsApi.get<ApiTypes.IBaseTaxonomy[]>(
    `${TAXONOMY_BASE_URL}?businessUnit=${businessUnit}`,
    options,
  );
}

export async function getTaxonomyById(
  docId: string,
  businessUnit: string,
  options: ApiClientOptions = { requiresAuth: true },
) {
  logger.log(`[TAXONOMY] Getting taxonomy for id: ${docId}`);
  return skillsApi.get<ApiTypes.IBaseTaxonomy>(
    `${TAXONOMY_BASE_URL}/${docId}?businessUnit=${businessUnit}`,
    options,
  );
}

export async function bulkUpsert(
  data: ApiTypes.IBulkUpsertDTO,
  options: ApiClientOptions = { requiresAuth: true },
) {
  logger.log(`[TAXONOMY] bulk upserting ${data.data.length} documents`);
  return skillsApi.post<ApiTypes.ITaxonomyResponse>(
    `${TAXONOMY_BASE_URL}/bulk-upsert`,
    data,
    options,
  );
}

export function useQueryTechnicalTaxonomy(
  businessUnit: string,
  options: ApiClientOptions = { requiresAuth: true },
) {
  logger.log(`[TAXONOMY] querying technical taxonomy`);
  return useQuery<ApiTypes.IBaseTaxonomy[]>(
    skillsApi,
    `${TAXONOMY_BASE_URL}?businessUnit=${businessUnit}`,
    options,
  );
}
