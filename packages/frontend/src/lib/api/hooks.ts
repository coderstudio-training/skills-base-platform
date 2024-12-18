'use client';

import { isTokenExpired } from '@/lib/api/auth';
import { learningApi, skillsApi, userApi } from '@/lib/api/client';
import { authConfig, rolePermissions } from '@/lib/api/config';
import { ApiError, ApiResponse, AuthState, Permission } from '@/lib/api/types';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

// Create a custom hook for auth state
export function useAuth() {
  const { data: session, status } = useSession();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    role: [],
  });

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.accessToken) {
      const checkToken = async () => {
        const tokenExpired = await isTokenExpired(session.user.accessToken);
        if (!tokenExpired) {
          setAuthState({
            isAuthenticated: true,
            user: session.user,
            role: session.user.role ? [session.user.role] : [],
          });
        }
      };
      checkToken();
    }
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

type FetchState<T> = {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
};

// Hook for fetching data in client components
export function useQuery<T>(
  apiInstance: typeof userApi | typeof skillsApi | typeof learningApi,
  endpoint: string,
  options?: {
    enabled?: boolean;
    revalidate?: number;
    requiresAuth?: boolean;
    cacheStrategy?: RequestCache;
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
        revalidate: options?.revalidate,
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
    options?.revalidate,
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
  apiInstance: typeof userApi | typeof skillsApi | typeof learningApi,
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST',
  options?: {
    requiresAuth?: boolean;
  },
) {
  const [state, setState] = useState<{
    data: T | null;
    error: ApiError | null;
    isLoading: boolean;
  }>({
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
