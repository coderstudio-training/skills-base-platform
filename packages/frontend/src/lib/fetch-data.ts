import { FetchApiResponse, FetchOptions } from '../types';
import { ApiConfig } from './apiConfig';
import { RequestConfig } from './requestConfig';

async function fetcher<T>(
  {
    service,
    endpoint,
    method = 'GET',
    body,
    headers,
    query = '',
    cache = 'no-store',
  }: RequestConfig<T>,
  fetchOptions?: FetchOptions,
): Promise<FetchApiResponse<T>> {
  const url = `${ApiConfig.microservices[service].baseUrl}${endpoint}${query}`;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        ...ApiConfig.defaultHeaders,
        ...headers,
      },
      body: JSON.stringify(body),
      cache: fetchOptions?.cache || cache,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: {
          message: data.message || 'Unknown error',
          code: data.code || 'ERROR',
          status: response.status,
        },
        status: response.status,
      };
    }

    return { data, error: null, status: response.status };
  } catch (error) {
    return {
      data: null,
      error: { message: (error as Error).message, code: 'NETWORK_ERROR', status: 0 },
      status: 0,
    };
  }
}

export default fetcher;
