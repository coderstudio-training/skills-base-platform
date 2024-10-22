import LoginForm from '@/components/auth/LoginForm';
import { Suspense } from 'react';

export default function AdminLoginPage() {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
