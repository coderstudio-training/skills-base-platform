import { FetchApiResponse } from '../types';
import fetcher from './fetch-data';
import { RequestConfig } from './requestConfig';

export async function fetcherAuth<T>(
  config: RequestConfig<T>,
  token_string?: string,
): Promise<FetchApiResponse<T>> {
  const token = token_string || localStorage.getItem('accessToken');

  if (!token) {
    return {
      data: null,
      error: { message: 'Missing token!', code: 'AUTH_ERROR', status: 401 },
      status: 401,
    };
  }

  const authHeaders = { Authorization: `Bearer ${token}` };
  return fetcher({ ...config, headers: { ...config.headers, ...authHeaders } });
}
