import { cache } from 'react';
import fetchData from './httpClient';

export const serverFetch = cache(async <T>(config: RequestConfig) => {
  return fetchData<T>(config);
});
