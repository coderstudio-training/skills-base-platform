import fetchData, { RequestConfig } from './httpClient';

export async function fetchWithAuth<T>(config: RequestConfig, token: string): Promise<T> {
  const authHeaders = { Authorization: `Bearer ${token}` };
  return fetchData<T>({ ...config, headers: { ...config.headers, ...authHeaders } });
}
