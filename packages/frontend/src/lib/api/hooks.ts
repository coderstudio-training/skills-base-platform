'use client';

import { isTokenExpired } from '@/lib/api/auth';
import { ApiClient, learningApi, skillsApi, userApi } from '@/lib/api/client';
import { authConfig, rolePermissions } from '@/lib/api/config';
import { ApiError, ApiResponse, AuthState, Permission } from '@/lib/api/types';
import { logger } from '@/lib/utils/logger';
import { signOut, useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { cacheStore } from './cache-store';

// Types and Interfaces
interface CacheOptions {
  requiresAuth?: boolean;
  cacheStrategy?: RequestCache;
  revalidate?: number;
  enabled?: boolean;
  tags?: string[];
}

interface CacheEntry<T> {
  status: 'success' | 'error' | 'pending';
  data?: T;
  error?: Error;
  promise?: Promise<T>;
}

interface FetchState<T> {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
}

type ApiInstance = typeof userApi | typeof skillsApi | typeof learningApi;

// Cache Configuration
const DEFAULT_CACHE_CONFIG = {
  cache: 'force-cache' as RequestCache,
  tags: ['all'] as string[],
};

// Cache Implementation
const cache = new Map<string, CacheEntry<unknown>>();

function getCacheKey(endpoint: string, options?: CacheOptions): string {
  return JSON.stringify({
    endpoint,
    options: {
      cache: options?.cacheStrategy || DEFAULT_CACHE_CONFIG.cache,
      tags: [...(options?.tags || []), ...DEFAULT_CACHE_CONFIG.tags],
      version: cacheStore.getVersion(), // Add version to cache key
    },
  });
}

// Auth Hook
export function useAuth() {
  const { data: session } = useSession();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    role: [],
  });

  useEffect(() => {
    const checkAuthState = async () => {
      if (session && session?.user?.accessToken) {
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
        setAuthState({ isAuthenticated: false, user: null, role: [] });
      }
    };

    checkAuthState();
  }, [session]);

  const hasPermission = useCallback(
    (permission: Permission) => authState.role.some(role => rolePermissions[role]?.[permission]),
    [authState.role],
  );

  const canAccessRoutes = useCallback(
    (route: string) => authState.role.some(role => authConfig.routes[role]?.includes(route)),
    [authState.role],
  );

  return {
    ...authState,
    hasPermission,
    canAccessRoutes,
  };
}

// Query Hook
export function useQuery<T>(
  apiInstance: ApiInstance,
  endpoint: string,
  options?: {
    enabled?: boolean;
    requiresAuth?: boolean;
    cacheStrategy?: RequestCache;
    revalidate?: number;
    tags?: string[];
  },
) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    isLoading: true,
  });

  const { isAuthenticated } = useAuth();
  const enabled = options?.enabled ?? true;

  useEffect(() => {
    const unsubscribe = cacheStore.subscribe(() => {
      if (enabled) {
        fetchData();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [enabled]);

  // Memoize options to prevent unnecessary re-renders
  const finalOptions = useMemo(
    () => ({
      requiresAuth: options?.requiresAuth,
      cache: options?.cacheStrategy || DEFAULT_CACHE_CONFIG.cache,
      tags: [...(options?.tags || []), ...DEFAULT_CACHE_CONFIG.tags],
    }),
    [options?.requiresAuth, options?.cacheStrategy, options?.tags],
  );

  const fetchData = useCallback(async () => {
    if (!enabled || (finalOptions.requiresAuth !== false && !isAuthenticated)) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await apiInstance.get<T>(endpoint, finalOptions);

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
  }, [apiInstance, endpoint, enabled, isAuthenticated, finalOptions]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}

// Mutation Hook
export function useMutation<T, TData = unknown>(
  apiInstance: ApiClient,
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST',
  options?: { requiresAuth?: boolean },
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
          response = await apiInstance.delete<T>(endpoint, {
            requiresAuth: options?.requiresAuth,
          });
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

      setState({ data: null, error: apiError, isLoading: false });
      return { data: null as T, error: apiError, status: 500 };
    }
  };

  return { ...state, mutate };
}

// Suspense Implementation
function suspenseFetcher<T>(apiInstance: ApiInstance, endpoint: string, options: CacheOptions): T {
  const cacheKey = getCacheKey(endpoint, options);
  const cachedResult = cache.get(cacheKey) as CacheEntry<T>;

  if (!cachedResult) {
    const promise = apiInstance
      .get<T>(endpoint, options)
      .then(response => {
        if (response.error) throw new Error(response.error.message);
        cache.set(cacheKey, { status: 'success', data: response.data });
        return response.data;
      })
      .catch(error => {
        cache.set(cacheKey, { status: 'error', error });
        throw error;
      });

    cache.set(cacheKey, { status: 'pending', promise });
    throw promise;
  }

  if (cachedResult.status === 'success') return cachedResult.data as T;
  if (cachedResult.status === 'error') throw cachedResult.error;
  throw cachedResult.promise;
}
// Suspense Query Hook
export function useSuspenseQuery<T>(
  apiInstance: ApiInstance,
  endpoint: string,
  options?: CacheOptions,
): T {
  const finalOptions = useMemo(
    () => ({
      ...DEFAULT_CACHE_CONFIG,
      cache: options?.cacheStrategy || DEFAULT_CACHE_CONFIG.cache,
      tags: [...(options?.tags || []), ...DEFAULT_CACHE_CONFIG.tags],
    }),
    [options?.cacheStrategy, options?.tags],
  );

  return suspenseFetcher<T>(apiInstance, endpoint, finalOptions);
}

// Server Data Fetching
export async function fetchServerData<T>(
  apiInstance: ApiInstance,
  endpoint: string,
  options?: { requiresAuth?: boolean },
): Promise<ApiResponse<T>> {
  try {
    return await apiInstance.get<T>(endpoint, {
      ...options,
      ...DEFAULT_CACHE_CONFIG,
    });
  } catch (error) {
    return {
      data: null as T,
      error: {
        status: 500,
        code: 'SERVER_FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Server fetch error occurred',
      },
    };
  }
}
