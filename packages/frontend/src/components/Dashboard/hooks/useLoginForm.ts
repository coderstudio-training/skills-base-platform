import { AuthResponse } from '@/components/Dashboard/types';
import { userApi } from '@/lib/api/client';
import { authConfig, errorMessages } from '@/lib/api/config';
import { useMutation } from '@/lib/api/hooks';
import { ApiResponse } from '@/lib/api/types';
import { logger } from '@/lib/utils/logger';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formState, setFormState] = useState({
    email: searchParams.get('email') || '',
    password: '',
  });
  // Automatic update upon search param change
  useEffect(() => {
    setFormState(prev => ({ ...prev, email: searchParams.get('email') || '' }));
  }, [searchParams]);

  const {
    mutate: adminLoginPost,
    error: adminLoginError,
    isLoading: adminLoginLoading,
  } = useMutation<AuthResponse, { email: string; password: string }>(
    userApi,
    `${authConfig.endpoints.login}`,
    'POST',
    {
      requiresAuth: false,
    },
  );

  async function authenticateUser(
    adminLoginPost: (
      data?: { email: string; password: string } | undefined,
    ) => Promise<ApiResponse<AuthResponse>>,
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> {
    logger.info('Starting authentication process');

    const userServiceUrl = process.env.NEXT_PUBLIC_USER_SERVICE_URL;
    if (!userServiceUrl) {
      logger.error('User service URL not configured');
      return {
        success: false,
        error: 'Authentication service not properly configured',
      };
    }

    try {
      // First step: Get token from user service
      const apiResponse = await adminLoginPost({ email, password });
      console.log('Api response:', apiResponse);
      if (!apiResponse.data?.access_token || apiResponse.error) {
        logger.error('Authentication failed:', {
          status: apiResponse.status,
          message: apiResponse.error?.message,
        });
        return {
          success: false,
          error: apiResponse.error?.message || errorMessages.INVALID_CREDENTIALS,
        };
      }

      // Second step: Sign in with NextAuth
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        access_token: apiResponse.data.access_token,
        callbackUrl: `${window.location.origin}/dashboard/admin`,
      });

      if (!result?.ok) {
        logger.error('NextAuth signin failed:' + result?.error);
        return {
          success: false,
          error: 'Failed to establish session',
        };
      }

      logger.info('Authentication successful');
      return { success: true };
    } catch (error) {
      logger.error('Authentication error:' + error);
      return {
        success: false,
        error: 'Network error occurred. Please try again.',
      };
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const result = await authenticateUser(adminLoginPost, formState.email, formState.password);
      if (result.success) {
        logger.info('Login successful');
        router.push('/dashboard/admin');
      }
      if (result.error) {
        logger.error('Login failed');
      }
    } catch (err) {
      logger.error('Login failed');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  return {
    formState,
    adminLoginError,
    adminLoginLoading,
    handleSubmit,
    handleInputChange,
  };
}
