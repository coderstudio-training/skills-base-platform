import { Suspense } from 'react';

function Placeholder() {
  return <p>Loading content...</p>;
}

function SomeLazyComponent() {
  return <div>Lazy-loaded content here!</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<Placeholder />}>
      <SomeLazyComponent />
    </Suspense>
  );
}
