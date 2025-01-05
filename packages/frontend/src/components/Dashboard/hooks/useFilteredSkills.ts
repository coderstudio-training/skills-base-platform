import { Taxonomy } from '@/components/Dashboard/types';
import { filterBU, getValueFromKey, isTSC } from '@/lib/utils/taxonomy-utils';
import { useMemo } from 'react';

export function useFilteredSkills(
  skills: Taxonomy[],
  selectedBusinessUnit: string,
  searchQuery?: string,
) {
  return useMemo(() => {
    const lowerCaseQuery = searchQuery?.trim().toLowerCase() || '';

    if (selectedBusinessUnit === getValueFromKey('ALL')) {
      // Case 1: All Business Units
      return skills.filter(skill => skill.title.toLowerCase().includes(lowerCaseQuery));
    }

    // Case 2: Specific Business Unit (only TSCs)
    const filteredTSCs = filterBU(
      skills.filter(isTSC), // Only TSCs
      selectedBusinessUnit, // Filtered by BU
    );

    if (searchQuery) {
      // Case 2a: With search query
      return filteredTSCs.filter(tsc => tsc.title.toLowerCase().includes(lowerCaseQuery));
    }

    // Case 2b: Without search query
    return filteredTSCs;
  }, [skills, selectedBusinessUnit, searchQuery]);
}
