import { Taxonomy } from '@/components/Dashboard/types';
import { filterBU, getValueFromKey, isSoftSkill, isTSC } from '@/lib/utils/taxonomy-utils';
import { useMemo } from 'react';

export function useFilteredSkills(
  skills: Taxonomy[],
  selectedBusinessUnit: string,
  searchQuery?: string,
) {
  return useMemo(
    () =>
      selectedBusinessUnit === getValueFromKey('ALL')
        ? skills.filter(skills =>
            skills.title
              .toLowerCase()
              .includes(searchQuery ? searchQuery.trim().toLowerCase() : ''),
          )
        : searchQuery
          ? ([
              ...skills.filter(skills => isSoftSkill(skills)),
              filterBU(
                skills.filter(skills => isTSC(skills)),
                selectedBusinessUnit,
              ).filter(tsc => tsc.title.toLowerCase().includes(searchQuery.trim().toLowerCase())),
            ] as Taxonomy[])
          : ([
              ...skills.filter(skills => isSoftSkill(skills)),
              filterBU(
                skills.filter(skills => isTSC(skills)),
                selectedBusinessUnit,
              ),
            ] as Taxonomy[]),
    [skills, selectedBusinessUnit, searchQuery],
  );
}
