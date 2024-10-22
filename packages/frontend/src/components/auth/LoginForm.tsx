'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { logger } from '@/lib/utils';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  //const { data: session, status } = useSession()
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await authenticateUser(email, password);
      if (result.success) {
        router.push('/dashboard/admin');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      console.error('Login Error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
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
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  logger.log('Starting signIn process');
  try {
    const userServiceUrl = process.env.NEXT_PUBLIC_USER_SERVICE_URL;
    logger.log(
      `Authenticating with User Service: ${userServiceUrl}/auth/login`
    );
    const apiResponse = await fetch(`${userServiceUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await apiResponse.json();
    logger.log('User Service Response:', {
      status: apiResponse.status,
      data: JSON.stringify(data),
    });

    if (!apiResponse.ok) {
      logger.error('User Service authentication failed');
      return { success: false, error: data.message || 'Authentication failed' };
    }

    if (!data.access_token) {
      logger.error('No access token in response');
      return {
        success: false,
        error: 'Invalid response from authentication service',
      };
    }

    logger.log(
      'User Service authentication successful, calling NextAuth signIn'
    );
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      access_token: data.access_token,
      callbackUrl: `${window.location.origin}/dashboard/admin`,
    });

    logger.log('NextAuth signIn result:', result);

    if (result?.error) {
      logger.error('NextAuth signIn failed:', result.error);
      return { success: false, error: result.error };
    }

    if (result?.ok) {
      logger.log('NextAuth signIn successful');
      return { success: true };
    }

    logger.error('Unexpected result from NextAuth signIn');
    return { success: false, error: 'An unexpected error occurred' };
  } catch (error) {
    logger.error('SignIn Error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}
