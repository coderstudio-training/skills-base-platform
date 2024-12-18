import ErrorPage from '@/components/error/ErrorPage';
import { errorMessages } from '@/lib/api/config';
import { notFound } from 'next/navigation';

export default function DynamicErrorPage({ params }: { params: { error: string } }) {
  const { error } = params;

  // Map dynamicError to appropriate status code and message
  const errorMapping: Record<string, { statusCode: number; message: string }> = {
    unauthorized: { statusCode: 401, message: errorMessages.UNAUTHORIZED },
    forbidden: { statusCode: 403, message: errorMessages.FORBIDDEN },
    'not-found': { statusCode: 404, message: errorMessages.NOT_FOUND },
    'server-error': { statusCode: 500, message: errorMessages.SERVER_ERROR },
  };

  const dynamicError = errorMapping[error];
  if (!dynamicError) notFound(); // Show 404 if error type is unknown
  return <ErrorPage statusCode={dynamicError.statusCode} message={dynamicError.message} />;
}
