// lib/api/client.ts
import { errorMessages, serverActionsConfig, serviceConfigs } from '@/lib/api/config';
import type {
  ApiClientOptions,
  ApiConfig,
  ApiResponse,
  FetchOptions,
  RetryConfig,
} from '@/lib/api/types';
import { buildFetchOptions } from '@/lib/utils';
import { cache } from 'react';
import { getAuthHeaders } from './auth';
import { cacheStore } from './cache-store';
import { performanceMonitor } from '../utils/performance-monitor';

const DEFAULT_CACHE_CONFIG = {
  cache: 'force-cache' as RequestCache,
  tags: ['all'] as string[],
};

export class ApiClient {
  private readonly config: ApiConfig;
  private readonly baseUrl: string;
  private readonly retryConfig: RetryConfig;

  constructor(serviceName: keyof typeof serviceConfigs) {
    this.config = serviceConfigs[serviceName];
    this.baseUrl = this.config.baseUrl;
    this.retryConfig = serverActionsConfig.errorHandling;
  }

  private sanitizeUrl(url: string): string {
    try {
      return new URL(url).toString();
    } catch {
      throw new Error(`Invalid URL: ${url}`);
    }
  }

  private sanitizeHeaders(headers: HeadersInit): Record<string, string> {
    const sanitizedHeaders: Record<string, string> = {};
    if (headers instanceof Headers) {
      headers.forEach((value, key) => {
        sanitizedHeaders[key.trim()] = value.trim();
      });
    } else if (Array.isArray(headers)) {
      headers.forEach(([key, value]) => {
        sanitizedHeaders[key.trim()] = value.trim();
      });
    } else if (typeof headers === 'object' && headers !== null) {
      Object.entries(headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          sanitizedHeaders[key.trim()] = value.trim();
        }
      });
    }
    return sanitizedHeaders;
  }

  private getErrorMessage(status: number): string {
    const errorMap: Record<number, string> = {
      401: errorMessages.UNAUTHORIZED,
      403: errorMessages.FORBIDDEN,
      404: errorMessages.NOT_FOUND,
      500: errorMessages.SERVER_ERROR,
    };
    return errorMap[status] || 'An error occurred';
  }

  private createErrorResponse<T>(status: number, code: string, message: string): ApiResponse<T> {
    return {
      data: null as T,
      error: { status, code, message },
      status,
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      return this.createErrorResponse<T>(
        response.status,
        response.statusText,
        this.getErrorMessage(response.status),
      );
    }

    const data = await response.json();
    return { data, error: null, status: response.status };
  }

  private async fetch(url: string, init?: RequestInit): Promise<Response> {
    const sanitizedUrl = this.sanitizeUrl(url);
    const urlWithVersion = new URL(sanitizedUrl);

    // Check server version before making request
    await cacheStore.checkServerVersion();
    urlWithVersion.searchParams.set('_cache', cacheStore.getVersion());

    const sanitizedHeaders = this.sanitizeHeaders(init?.headers || {});
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(urlWithVersion.toString(), {
        ...init,
        headers: sanitizedHeaders,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async retryRequest<T>(url: string, requestInit: RequestInit): Promise<ApiResponse<T>> {
    const correlationId = crypto.randomUUID();

    return performanceMonitor.trackRequest(
      async () => {
        let attempt = 0;
        while (attempt <= this.retryConfig.retryCount) {
          try {
            const response = await this.fetch(url, {
              ...requestInit,
              headers: {
                ...requestInit.headers,
                'X-Correlation-ID': correlationId,
              },
            });
            return this.handleResponse<T>(response);
          } catch (error) {
            if (attempt < this.retryConfig.retryCount) {
              attempt++;
              await new Promise(resolve => setTimeout(resolve, this.retryConfig.retryDelay));
              continue;
            }
            return this.createErrorResponse<T>(
              500,
              'FETCH_ERROR',
              `Network error after ${this.retryConfig.retryCount} retries`,
            );
          }
        }
        return this.createErrorResponse<T>(500, 'FETCH_ERROR', 'Max retries exceeded');
      },
      url,
      requestInit.method || 'GET',
      { correlationId },
    );
  }

  private cachedFetch = cache(
    async <T>(
      endpoint: string,
      options: FetchOptions = {},
      requiresAuth: boolean = true,
    ): Promise<ApiResponse<T>> => {
      const url = new URL(endpoint, this.baseUrl);
      const finalOptions = buildFetchOptions(options);
      const authHeaders = requiresAuth ? await getAuthHeaders() : {};

      // Check server version before making request
      await cacheStore.checkServerVersion();
      url.searchParams.set('_cache', cacheStore.getVersion());

      const requestInit: RequestInit = {
        headers: {
          ...this.config.defaultHeaders,
          ...authHeaders,
          ...finalOptions.headers,
        },
        cache: finalOptions.cache || DEFAULT_CACHE_CONFIG.cache,
      };

      try {
        return await this.retryRequest<T>(url.toString(), requestInit);
      } catch (error) {
        return this.createErrorResponse<T>(
          500,
          'FETCH_ERROR',
          error instanceof Error ? error.message : errorMessages.NETWORK_ERROR,
        );
      }
    },
  );

  async get<T>(
    endpoint: string,
    options?: ApiClientOptions & { requiresAuth?: boolean },
  ): Promise<ApiResponse<T>> {
    return this.cachedFetch<T>(
      endpoint,
      {
        cache: options?.cache || DEFAULT_CACHE_CONFIG.cache,
        tags: [...(options?.tags || []), ...DEFAULT_CACHE_CONFIG.tags],
      },
      options?.requiresAuth !== false,
    );
  }

  async post<T>(
    endpoint: string,
    data: unknown,
    options?: ApiClientOptions & { requiresAuth?: boolean },
  ): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseUrl);
    const authHeaders = options?.requiresAuth !== false ? await getAuthHeaders() : {};

    return this.retryRequest<T>(url.toString(), {
      method: 'POST',
      headers: {
        ...this.config.defaultHeaders,
        ...authHeaders,
      },
      body: JSON.stringify(data),
      cache: 'no-store',
    });
  }

  async put<T>(
    endpoint: string,
    data: unknown,
    options?: ApiClientOptions & { requiresAuth?: boolean },
  ): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseUrl);
    const authHeaders = options?.requiresAuth !== false ? await getAuthHeaders() : {};

    return this.retryRequest<T>(url.toString(), {
      method: 'PUT',
      headers: {
        ...this.config.defaultHeaders,
        ...authHeaders,
      },
      body: JSON.stringify(data),
      cache: 'no-store',
    });
  }

  async delete<T>(
    endpoint: string,
    options?: ApiClientOptions & { requiresAuth?: boolean },
  ): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseUrl);
    const authHeaders = options?.requiresAuth !== false ? await getAuthHeaders() : {};

    return this.retryRequest<T>(url.toString(), {
      method: 'DELETE',
      headers: {
        ...this.config.defaultHeaders,
        ...authHeaders,
      },
      cache: 'no-store',
    });
  }
}

export const userApi = new ApiClient('users');
export const skillsApi = new ApiClient('skills');
export const learningApi = new ApiClient('learning');
