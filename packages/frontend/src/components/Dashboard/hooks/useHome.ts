import { logger } from '@/lib/utils';
import { Session } from 'next-auth';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import useScrollTo from './useScrollTo';

export function useHome() {
  const { data: session, status } = useSession() as {
    data: Session | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
  };
  const [email, setEmail] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const featuresData = [
    { name: 'Skill Assessment', value: 30 },
    { name: 'Learning Paths', value: 25 },
    { name: 'Performance Tracking', value: 20 },
    { name: 'Team Management', value: 15 },
    { name: 'Integrations', value: 10 },
  ];

  const benefitsData = [
    { name: 'Productivity', increase: 40 },
    { name: 'Retention', increase: 30 },
    { name: 'Efficiency', increase: 20 },
    { name: 'Satisfaction', increase: 10 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const handleEmailValidation = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAdminEmail = (email: string): boolean => {
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
    return adminEmails.includes(email.toLowerCase());
  };

  const handleAllowedDomain = (email: string): boolean => {
    const allowedDomain = process.env.NEXT_PUBLIC_ALLOWED_DOMAIN || `@stratpoint.com`;
    return email.toLowerCase().endsWith(allowedDomain);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!handleEmailValidation(email)) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    if (handleAdminEmail(email)) {
      router.push(`/admin-login?email=${encodeURIComponent(email)}`);
    } else if (handleAllowedDomain(email)) {
      try {
        await signIn('google', {
          callbackUrl: '/',
          loginHint: email,
        });
      } catch (err) {
        logger.error(err);
        setError('An unexpected error occurred. Please try again.');
      }
    } else {
      setError('Your email domain is not authorized to access this application.');
    }

    setIsLoading(false);
  };

  // Routing logic moved to `useHome`
  useEffect(() => {
    const handleInitialRouting = async () => {
      if (status === 'loading') return;

      // redirect in lib/auth.ts overwrites this.
      if (status === 'authenticated' && session?.user?.role) {
        const baseRoute = '/dashboard';
        const role = session.user.role.toLowerCase();
        router.push(`${baseRoute}/${role}`);
      }
    };

    handleInitialRouting();
  }, [session, status, router]);

  const { scrollTo } = useScrollTo();

  const handleScrollToForm = () => {
    scrollTo('get-started-form'); // Pass the `id` when the button is clicked.
  };

  return {
    featuresData,
    benefitsData,
    COLORS,
    email,
    setEmail,
    session,
    status,
    activeTab,
    setActiveTab,
    isLoading,
    error,
    handleSubmit,
    handleAllowedDomain,
    handleAdminEmail,
    handleScrollToForm,
  };
}
