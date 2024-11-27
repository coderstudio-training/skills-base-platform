import { useMemo } from 'react';
import { TSC } from '../types';
import { getKeyFromValue, getValueFromKey } from '../utils';

export const useFilteredTSCs = (tscs: TSC[], selectedBusinessUnit: string) => {
  return useMemo(
    () =>
      selectedBusinessUnit === getValueFromKey('ALL')
        ? tscs
        : tscs.filter(tsc => tsc.businessUnit === getKeyFromValue(selectedBusinessUnit)),
    [tscs, selectedBusinessUnit],
  );
};
