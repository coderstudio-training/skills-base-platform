'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { userApi } from '@/lib/api/client';
import { errorMessages } from '@/lib/api/config';
import { useMutation } from '@/lib/api/hooks';
import { ApiResponse } from '@/lib/api/types';
import { logger } from '@/lib/utils';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface AuthResponse {
  access_token?: string;
  message?: string;
  status?: number;
}

export default function LoginForm() {
  // Changed from AdminLoginPage to LoginForm
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formState, setFormState] = useState({
    email: searchParams.get('email') || '',
    password: '',
  });

  const { mutate, error, isLoading } = useMutation<
    AuthResponse,
    { email: string; password: string }
  >(userApi, '/auth/login', 'POST', {
    requiresAuth: false,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState(prev => ({ ...prev, isLoading: true, error: '' }));

    try {
      const result = await authenticateUser(mutate, formState.email, formState.password);
      if (result.success) {
        router.push('/dashboard/admin');
      } else {
        setFormState(prev => ({
          ...prev,
          error: result.error || 'Invalid email or password',
        }));
      }
    } catch (err) {
      logger.error('Login Error:', err);
      setFormState(prev => ({
        ...prev,
        error: 'An unexpected error occurred. Please try again.',
      }));
    } finally {
      setFormState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                value={formState.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formState.password}
                onChange={handleInputChange}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Log in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

async function authenticateUser(
  mutate: (
    data?: { email: string; password: string } | undefined,
  ) => Promise<ApiResponse<AuthResponse>>,
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  logger.log('Starting authentication process');

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
    const apiResponse = await mutate({ email, password });
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
      logger.error('NextAuth signin failed:', result?.error);
      return {
        success: false,
        error: 'Failed to establish session',
      };
    }

    logger.log('Authentication successful');
    return { success: true };
  } catch (error) {
    logger.error('Authentication error:', error);
    return {
      success: false,
      error: 'Network error occurred. Please try again.',
    };
  }
}
