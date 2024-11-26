import ErrorPage from '@/components/shared/ErrorPage';

export default function DefaultErrorPage() {
  return <ErrorPage statusCode="Error" message="An unexpected error occurred." />;
}
