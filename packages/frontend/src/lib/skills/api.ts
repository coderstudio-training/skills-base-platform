import * as ApiTypes from '@/lib/skills/types';
import { logger } from '@/lib/utils';
import { skillsApi } from '../api/client';
import { ApiClientOptions } from '../api/types';

const TAXONOMY_BASE_URL = '/taxonomy';

export async function getTechnicalTaxonomy(
  businessUnit: string,
  options: ApiClientOptions = { requiresAuth: true },
) {
  logger.log(`[BusinessUnit] ${businessUnit} `);
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
  logger.log(docId);
  return skillsApi.get<ApiTypes.IBaseTaxonomy>(
    `${TAXONOMY_BASE_URL}/${docId}?businessUnit=${businessUnit}`,
    options,
  );
}

export async function bulkUpsert(
  data: ApiTypes.IBulkUpsertDTO,
  options: ApiClientOptions = { requiresAuth: true },
) {
  logger.log(data);
  return skillsApi.post<ApiTypes.ITaxonomyResponse>(
    `${TAXONOMY_BASE_URL}/bulk-upsert`,
    data,
    options,
  );
}
