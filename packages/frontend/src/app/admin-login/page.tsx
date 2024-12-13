import { Suspense } from 'react';
import LoginForm from '@/components/auth';
export default function AdminLoginPage() {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
