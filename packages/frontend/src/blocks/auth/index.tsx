'use client';

import { useLoginForm } from '@/blocks/Dashboard/hooks/useLoginForm';
import { LoginFormCard } from '../Dashboard/components/Cards/LoginFormCard';

export default function LoginForm() {
  const { formState, adminLoginError, adminLoginLoading, handleSubmit, handleInputChange } =
    useLoginForm();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <LoginFormCard
        formState={formState}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        adminLoginLoading={adminLoginLoading}
        adminLoginError={adminLoginError}
      />
    </div>
  );
}
