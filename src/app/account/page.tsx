'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Redirect /account to /profile
export default function AccountPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/profile');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-xl">Presmerovávam na profil...</div>
    </div>
  );
}
