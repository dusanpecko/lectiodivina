// 2. VYTVORTE: app/auth/reset-password/page.tsx
import { Suspense } from 'react';
import ResetPasswordForm from './ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Načítavam obnovu hesla...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}