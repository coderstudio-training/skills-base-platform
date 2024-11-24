import ErrorPage from '@/components/shared/ErrorPage';

export default function NotFound() {
  return (
    <ErrorPage
      statusCode={404}
      message={'Oops! The page you’re looking for doesn’t exist.'}
    ></ErrorPage>
  );
}
