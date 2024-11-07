import { apiConfig } from './apiConfig';

export interface RequestConfig {
  service: keyof (typeof apiConfig)['microservices'];
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: object;
  headers?: Record<string, string>;
  cache?: RequestCache;
}

async function fetchData<T>({
  service,
  path,
  method = 'GET',
  body,
  headers,
  cache = 'default',
}: RequestConfig): Promise<T> {
  const url = `${apiConfig.microservices[service].baseUrl}${path}`;
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
    cache,
  });
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export default fetchData;
