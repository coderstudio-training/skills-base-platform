import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Suspense fallback={<Skeleton className="w-full h-screen" />}>{children}</Suspense>
    </div>
  );
}
