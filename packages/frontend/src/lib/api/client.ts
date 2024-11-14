import { cache } from 'react';
import { getAuthHeaders } from './auth';
import { errorMessages, serviceConfigs } from './config';
import type { ApiClientOptions, ApiConfig, ApiError, ApiResponse, FetchOptions } from './types';

export class ApiClient {
  private config: ApiConfig;
  private baseUrl: string;

  constructor(serviceName: keyof typeof serviceConfigs) {
    this.config = serviceConfigs[serviceName];
    this.baseUrl = this.config.baseUrl;
  }

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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private cachedFetch = cache(
    async <T>(
      endpoint: string,
      options: FetchOptions = {},
      requiresAuth: boolean = true,
    ): Promise<ApiResponse<T>> => {
      const url = new URL(endpoint, this.baseUrl);

      // Apply headers with token if required
      const authHeaders = requiresAuth ? await getAuthHeaders() : {};
      const requestInit: RequestInit = {
        headers: {
          ...this.config.defaultHeaders,
          ...authHeaders,
          ...options.headers,
        },
        cache: options.cache,
        next: {
          revalidate: options.revalidate,
          tags: options.tags,
        },
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
    },
  );

  // Public API methods
  async get<T>(
    endpoint: string,
    options?: ApiClientOptions & { requiresAuth?: boolean },
  ): Promise<ApiResponse<T>> {
    return this.cachedFetch<T>(
      endpoint,
      {
        cache: options?.cache || 'force-cache',
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
      method: 'POST',
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
