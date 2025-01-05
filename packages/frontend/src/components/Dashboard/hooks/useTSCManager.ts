import { IBaseTaxonomy, ISoftTaxonomy, Taxonomy, TSC } from '@/components/Dashboard/types';
import { skillsApi } from '@/lib/api/client';
import { useSuspenseQuery } from '@/lib/api/hooks';
import { buildProficiency } from '@/lib/utils/taxonomy-utils';

export function useTSCManager() {
  const TAXONOMY_BASE_URL = '/taxonomy';

  const technicalTaxonomy = useSuspenseQuery<IBaseTaxonomy[]>(
    skillsApi,
    `${TAXONOMY_BASE_URL}/technical/?businessUnit=QA`,
    {
      requiresAuth: true,
      cacheStrategy: 'force-cache',
    },
  );

  const softTaxonomy = useSuspenseQuery<ISoftTaxonomy[]>(skillsApi, `${TAXONOMY_BASE_URL}/soft`, {
    requiresAuth: true,
    cacheStrategy: 'force-cache',
  });

  const data = [
    ...technicalTaxonomy.map(
      tsc =>
        ({
          type: 'technical',
          id: tsc.docId,
          businessUnit: 'QA', //to be dynamic
          category: tsc.category,
          title: tsc.title,
          description: tsc.description,
          proficiencies: buildProficiency(tsc),
          rangeOfApplication: tsc.rangeOfApplication,
        }) as TSC,
    ),
    ...softTaxonomy.map(ssc => ({
      type: 'soft',
      id: ssc.docId,
      category: ssc.category,
      title: ssc.title,
      description: ssc.description,
      rating: ssc.rating,
      proficiencies: buildProficiency(ssc),
    })),
  ] as Taxonomy[];

  return {
    data,
  };
}
