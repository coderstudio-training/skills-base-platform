import { TSC } from '@/blocks/Dashboard/types';
import { getKeyFromValue, getValueFromKey } from '@/lib/utils';
import { useMemo } from 'react';

export const useFilteredTSCs = (
  tscs: TSC[],
  selectedBusinessUnit: string,
  searchQuery?: string,
) => {
  return useMemo(
    () =>
      selectedBusinessUnit === getValueFromKey('ALL')
        ? tscs.filter(tsc =>
            tsc.title.toLowerCase().includes(searchQuery ? searchQuery.trim().toLowerCase() : ''),
          )
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
