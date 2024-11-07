import { cache } from 'react';
import fetchData, { RequestConfig } from './httpClient';

export const serverFetch = cache(async <T>(config: RequestConfig) => {
  return fetchData<T>(config);
});
