import { TSC } from '@/components/TSC/types';
import { useMemo } from 'react';
import { getKeyFromValue, getValueFromKey } from '../utils';

export const useFilteredTSCs = (
  tscs: TSC[],
  selectedBusinessUnit: string,
  searchQuery?: string,
) => {
  return useMemo(
    () =>
      selectedBusinessUnit === getValueFromKey('ALL')
        ? tscs
        : searchQuery
          ? filterBU(tscs, selectedBusinessUnit).filter(tsc =>
              tsc.title.toLowerCase().includes(searchQuery.trim().toLowerCase()),
            )
          : filterBU(tscs, selectedBusinessUnit),
    [tscs, selectedBusinessUnit, searchQuery],
  );
};

function filterBU(tscs: TSC[], selectedBusinessUnit: string): TSC[] {
  return tscs.filter(tsc => tsc.businessUnit === getKeyFromValue(selectedBusinessUnit));
}
