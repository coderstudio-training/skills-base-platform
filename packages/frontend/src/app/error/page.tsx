import ErrorPage from '@/components/error/ErrorPage';

export default function DefaultErrorPage() {
  return <ErrorPage statusCode="Error" message="An unexpected error occurred." />;
}
