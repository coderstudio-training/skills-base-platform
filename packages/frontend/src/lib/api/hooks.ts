'use client';

import { isTokenExpired } from '@/lib/api/auth';
import { learningApi, skillsApi, userApi } from '@/lib/api/client';
import { authConfig, rolePermissions } from '@/lib/api/config';
import { ApiError, ApiResponse, AuthState, Permission } from '@/lib/api/types';
import { logger } from '@/lib/utils';
import { signOut, useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

interface CacheOptions {
  requiresAuth?: boolean;
  cacheStrategy?: RequestCache;
  revalidate?: number;
  enabled?: boolean;
}

interface CacheEntry<T> {
  status: 'success' | 'error' | 'pending';
  data?: T;
  error?: Error;
  promise?: Promise<T>;
}

// Cache key generation
function getCacheKey(endpoint: string, options?: CacheOptions): string {
  return JSON.stringify({
    endpoint,
    options: {
      requiresAuth: options?.requiresAuth,
      cacheStrategy: options?.cacheStrategy,
      revalidate: options?.revalidate,
    },
  });
}

// Memoized cache for suspense fetching
const cache = new Map<string, CacheEntry<unknown>>();

export function useAuth() {
  const { data: session, status } = useSession();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    role: [],
  });

  useEffect(() => {
    const checkAuthState = async () => {
      if (status === 'authenticated' && session?.user?.accessToken) {
        const tokenExpired = await isTokenExpired(session.user.accessToken);

        if (tokenExpired) {
          logger.warn('Access token is expired. Logging out...');
          await signOut({ callbackUrl: '/' });
          return;
        }

        setAuthState({
          isAuthenticated: true,
          user: session.user,
          role: session.user.role ? [session.user.role] : [],
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          role: [],
        });
      }
    };

    checkAuthState();
  }, [session, status]);

  const hasPermission = useCallback(
    (permission: Permission) => {
      if (!authState.role.length) return false;
      return authState.role.some(role => rolePermissions[role][permission]);
    },
    [authState.role],
  );

  const canAccessRoutes = useCallback(
    (route: string) => {
      if (!authState.role.length) return false;
      return authState.role.some(role => authConfig.routes[role].includes(route));
    },
    [authState.role],
  );

  return {
    ...authState,
    hasPermission,
    canAccessRoutes,
  };
}

interface FetchState<T> {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
}

type ApiInstance = typeof userApi | typeof skillsApi | typeof learningApi;

// Hook for fetching data in client components
export function useQuery<T>(
  apiInstance: ApiInstance,
  endpoint: string,
  options?: {
    enabled?: boolean;
    requiresAuth?: boolean;
    cacheStrategy?: RequestCache;
    revalidate?: number;
  },
) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    isLoading: true,
  });

  const { isAuthenticated } = useAuth();
  const enabled = options?.enabled ?? true;

  const fetchData = useCallback(async () => {
    if (!enabled || (options?.requiresAuth !== false && !isAuthenticated)) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await apiInstance.get<T>(endpoint, {
        requiresAuth: options?.requiresAuth,
        cache: options?.cacheStrategy,
      });

      setState({
        data: response.data,
        error: response.error,
        isLoading: false,
      });
    } catch (error) {
      setState({
        data: null,
        error: {
          status: 500,
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'An error occurred',
        },
        isLoading: false,
      });
    }
  }, [
    apiInstance,
    endpoint,
    enabled,
    isAuthenticated,
    options?.requiresAuth,
    options?.cacheStrategy,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData,
  };
}

// Hook for mutations (POST, PUT, DELETE) in client components
export function useMutation<T, TData = unknown>(
  apiInstance: ApiInstance,
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST',
  options?: {
    requiresAuth?: boolean;
  },
) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const { isAuthenticated } = useAuth();

  const mutate = async (data?: TData): Promise<ApiResponse<T>> => {
    if (options?.requiresAuth !== false && !isAuthenticated) {
      const error = {
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      };
      setState({ data: null, error, isLoading: false });
      return { data: null as T, error, status: 401 };
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      let response: ApiResponse<T>;

      switch (method) {
        case 'POST':
          response = await apiInstance.post<T>(endpoint, data, {
            requiresAuth: options?.requiresAuth,
          });
          break;
        case 'PUT':
          response = await apiInstance.put<T>(endpoint, data, {
            requiresAuth: options?.requiresAuth,
          });
          break;
        case 'DELETE':
          response = await apiInstance.delete<T>(endpoint, { requiresAuth: options?.requiresAuth });
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      setState({
        data: response.data,
        error: response.error,
        isLoading: false,
      });

      return response;
    } catch (error) {
      const apiError = {
        status: 500,
        code: 'MUTATION_ERROR',
        message: error instanceof Error ? error.message : 'An error occurred',
      };

      setState({
        data: null,
        error: apiError,
        isLoading: false,
      });

      return { data: null as T, error: apiError };
    }
  };

  return {
    ...state,
    mutate,
  };
}

// Suspense fetcher implementation
function suspenseFetcher<T>(
  apiInstance: ApiInstance,
  endpoint: string,
  options: CacheOptions = {},
): T {
  const key = getCacheKey(endpoint, options);

  if (cache.has(key)) {
    const result = cache.get(key) as CacheEntry<T>;

    if (result.status === 'success' && result.data) {
      return result.data;
    }

    if (result.status === 'pending' && result.promise) {
      throw result.promise;
    }

    if (result.status === 'error' && result.error) {
      logger.error('[Suspense Error]', result.error);
      throw result.error;
    }
  }

  const promise = apiInstance
    .get<T>(endpoint, {
      ...options,
      cache: options.cacheStrategy || 'default',
    })
    .then(response => {
      if (response.error) throw new Error(response.error.message || 'Unknown API error');

      cache.set(key, {
        status: 'success',
        data: response.data,
      });

      return response.data;
    })
    .catch(error => {
      const wrappedError = new Error(error.message || 'Failed to fetch data');
      wrappedError.stack = error.stack;
      cache.set(key, {
        status: 'error',
        error: wrappedError,
      });
      throw wrappedError;
    });

  cache.set(key, {
    status: 'pending',
    promise,
  });

  throw promise;
}

// Suspense Query Hook
export function useSuspenseQuery<T>(
  apiInstance: ApiInstance,
  endpoint: string,
  options?: CacheOptions,
): T {
  return suspenseFetcher<T>(apiInstance, endpoint, options);
}

// Server component data fetching function
export async function fetchServerData<T>(
  apiInstance: ApiInstance,
  endpoint: string,
  options?: {
    requiresAuth?: boolean;
  },
): Promise<ApiResponse<T>> {
  try {
    return await apiInstance.get<T>(endpoint, options);
  } catch (error) {
    return {
      data: null as T,
      error: {
        status: 500,
        code: 'SERVER_FETCH_ERROR',
        message: error instanceof Error ? error.message : 'An error occurred during server fetch',
      },
    };
  }
}
