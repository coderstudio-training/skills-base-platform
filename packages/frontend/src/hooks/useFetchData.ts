import useSWR from 'swr';
import fetchData from '../lib/httpClient';

export function useFetchData<T>(service: string, path: string) {
  const { data, error, mutate } = useSWR<T>([service, path], ([service, path]) =>
    fetchData<T>({ service, path }),
  );

  return { data, error, mutate, isLoading: !data && !error };
}
