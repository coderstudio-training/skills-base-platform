import { errorMessages, serverActionsConfig, serviceConfigs } from '@/lib/api/config';
import type {
  ApiClientOptions,
  ApiConfig,
  ApiError,
  ApiResponse,
  FetchOptions,
  RetryConfig,
} from '@/lib/api/types';
import { buildFetchOptions } from '@/lib/utils';
import { cache } from 'react';
import { getAuthHeaders } from './auth';

export class ApiClient {
  private config: ApiConfig;
  private baseUrl: string;
  private retryConfig: RetryConfig;

  constructor(serviceName: keyof typeof serviceConfigs) {
    this.config = serviceConfigs[serviceName];
    this.baseUrl = this.config.baseUrl;
    this.retryConfig = serverActionsConfig.errorHandling;
  }

  private sanitizeUrl(url: string): string {
    try {
      const sanitizedUrl = new URL(url);
      return sanitizedUrl.toString();
    } catch {
      throw new Error(`Invalid URL: ${url}`);
    }
  }

  private sanitizeHeaders(headers: HeadersInit): Record<string, string> {
    const sanitizedHeaders: Record<string, string> = {};

    if (headers instanceof Headers) {
      // Convert Headers instance to Record<string, string>
      headers.forEach((value, key) => {
        sanitizedHeaders[key.trim()] = value.trim();
      });
    } else if (Array.isArray(headers)) {
      // Handle array of tuples [string, string][]
      headers.forEach(([key, value]) => {
        sanitizedHeaders[key.trim()] = value.trim();
      });
    } else if (typeof headers === 'object' && headers !== null) {
      // Handle plain object
      Object.entries(headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          sanitizedHeaders[key.trim()] = value.trim();
        }
      });
    }

    return sanitizedHeaders;
  }

  // Might be useful for the bulk-upserts, as you retrieve __v and _id metadata.
  // private sanitizeResponse<T>(data: T): T {
  //   if (typeof data === 'object' && data !== null) {
  //     delete (data as any).data.metadata;
  //   }
  //   return data;
  // }

  private getErrorMessage(status: number): string {
    switch (status) {
      case 401:
        return errorMessages.UNAUTHORIZED;
      case 403:
        return errorMessages.FORBIDDEN;
      case 404:
        return errorMessages.NOT_FOUND;
      case 500:
        return errorMessages.SERVER_ERROR;
      default:
        return 'An error occurred';
    }
  }
  // base class implementation alongside fetch
  private async handleResponse<T>(
    response: Response,
    requestInit?: RequestInit,
  ): Promise<ApiResponse<T>> {
    console.log(requestInit);
    if (!response.ok) {
      const error: ApiError = {
        status: response.status,
        code: response.statusText,
        message: this.getErrorMessage(response.status),
      };

      if (response.status === 401) {
        return { data: null as T, error };
      }

      return { data: null as T, error, status: response.status };
    }

    const data = await response.json();
    return { data, error: null, status: response.status };
  }

  private async fetch(url: string, init?: RequestInit): Promise<Response> {
    const sanitizedUrl = this.sanitizeUrl(url);
    const sanitizedHeaders = this.sanitizeHeaders(init?.headers || {});

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(sanitizedUrl, {
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
  // Used for 'GET' method, ergo useQuery
  private cachedFetch = cache(
    async <T>(
      endpoint: string,
      options: FetchOptions = {},
      requiresAuth: boolean = true,
    ): Promise<ApiResponse<T>> => {
      const url = new URL(endpoint, this.baseUrl);

      const finalOptions = buildFetchOptions(options);
      const authHeaders = requiresAuth ? await getAuthHeaders() : {};

      let requestInit: RequestInit;
      if (finalOptions.cache === null || finalOptions.cache === undefined) {
        requestInit = {
          headers: {
            ...this.config.defaultHeaders,
            ...authHeaders,
            ...finalOptions.headers,
          },
          next: {
            revalidate: finalOptions.revalidate,
            tags: options.tags || [],
          },
        };
      } else {
        requestInit = {
          headers: {
            ...this.config.defaultHeaders,
            ...authHeaders,
            ...finalOptions.headers,
          },
          cache: finalOptions.cache,
        };
      }

      try {
        const response = await this.retryRequest<T>(url.toString(), requestInit);
        return response;
      } catch (error) {
        return {
          data: null as T,
          error: {
            status: 500,
            code: 'FETCH_ERROR',
            message: error instanceof Error ? error.message : errorMessages.NETWORK_ERROR,
          },
        };
      }
    },
  );
  // Generic retry logic available for all methods but implemented in 'GET'
  private async retryRequest<T>(url: string, requestInit: RequestInit): Promise<ApiResponse<T>> {
    let attempt = 0;

    while (attempt <= this.retryConfig.retryCount) {
      try {
        // Attempt the API call using fetch
        const response = await this.fetch(url, requestInit);
        return this.handleResponse<T>(response, requestInit);
      } catch (error) {
        if (attempt < this.retryConfig.retryCount) {
          attempt++;
          console.log(`Retrying request... Attempt ${attempt}`);
          await new Promise(resolve => setTimeout(resolve, this.retryConfig.retryDelay)); // Wait before retrying
        } else {
          console.log('Max retries reached. Returning error.');
          return {
            data: null as T,
            error: {
              status: 500,
              code: 'FETCH_ERROR',
              message: `Network error persists after ${this.retryConfig.retryCount} retries. Failed to fetch.`,
            },
          };
        }
      }
    }

    // This point should never be reached due to the catch block handling all errors
    return { data: null as T, error: null, status: 500 };
  }
  // Public API methods
  async get<T>(
    endpoint: string,
    options?: ApiClientOptions & { requiresAuth?: boolean },
  ): Promise<ApiResponse<T>> {
    return this.cachedFetch<T>(
      endpoint,
      {
        cache: options?.cache,
        revalidate: options?.revalidate,
        tags: options?.tags,
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

    const requestInit: RequestInit = {
      method: 'POST',
      headers: {
        ...this.config.defaultHeaders,
        ...authHeaders,
      },
      body: JSON.stringify(data),
      cache: 'no-store',
    };

    try {
      const response = await this.fetch(url.toString(), requestInit); // replace this block with return this.retryRequest<T>(url.toString(), requestInit) for retry logic
      return this.handleResponse<T>(response, requestInit);
    } catch (error) {
      return {
        data: null as T,
        error: {
          status: 500,
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : errorMessages.NETWORK_ERROR,
        },
      };
    }
  }

  async put<T>(
    endpoint: string,
    data: unknown,
    options?: ApiClientOptions & { requiresAuth?: boolean },
  ): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseUrl);
    const authHeaders = options?.requiresAuth !== false ? await getAuthHeaders() : {};

    const requestInit: RequestInit = {
      method: 'PUT',
      headers: {
        ...this.config.defaultHeaders,
        ...authHeaders,
      },
      body: JSON.stringify(data),
      cache: 'no-store',
    };

    try {
      const response = await this.fetch(url.toString(), requestInit);
      return this.handleResponse<T>(response, requestInit);
    } catch (error) {
      return {
        data: null as T,
        error: {
          status: 500,
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : errorMessages.NETWORK_ERROR,
        },
      };
    }
  }

  async delete<T>(
    endpoint: string,
    options?: ApiClientOptions & { requiresAuth?: boolean },
  ): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseUrl);
    const authHeaders = options?.requiresAuth !== false ? await getAuthHeaders() : {};

    const requestInit: RequestInit = {
      method: 'DELETE',
      headers: {
        ...this.config.defaultHeaders,
        ...authHeaders,
      },
      cache: 'no-store',
    };

    try {
      const response = await this.fetch(url.toString(), requestInit);
      return this.handleResponse<T>(response, requestInit);
    } catch (error) {
      return {
        data: null as T,
        error: {
          status: 500,
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : errorMessages.NETWORK_ERROR,
        },
      };
    }
  }
}

export const userApi = new ApiClient('users');
export const skillsApi = new ApiClient('skills');
export const learningApi = new ApiClient('learning');
