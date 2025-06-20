// app/reset-password/ResetPasswordForm.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

const supabase = createPagesBrowserClient();

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tokenValidated, setTokenValidated] = useState(false);

  useEffect(() => {
    const access_token = searchParams.get('access_token');
    const refresh_token = searchParams.get('refresh_token');
    const type = searchParams.get('type');

    if (type === 'recovery' && access_token && refresh_token) {
      supabase.auth
        .setSession({ access_token, refresh_token })
        .then(({ error }) => {
          if (error) setError('Link na obnovenie hesla je neplatný alebo expirovaný.');
          else setTokenValidated(true);
        });
    } else {
      setError('Neplatný alebo neúlný link na obnovu hesla.');
    }
  }, [searchParams]);

  const validatePassword = (value: string): string | null => {
    if (value.length < 6) return 'Heslo musí mať aspoň 6 znakov.';
    if (!/[a-z]/.test(value)) return 'Heslo musí obsahovať malé písmeno.';
    if (!/[A-Z]/.test(value)) return 'Heslo musí obsahovať veľké písmeno.';
    if (!/[0-9]/.test(value)) return 'Heslo musí obsahovať číslicu.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validation = validatePassword(password);
    if (validation) return setError(validation);
    if (password !== confirmPassword) return setError('Heslá sa nezhodujú.');

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError('Nepodarilo sa zmeniť heslo. Skúste to znova.');
    } else {
      setSuccess('Heslo bolo úspešne zmenené.');
      await supabase.auth.signOut();
      setTimeout(() => {
        router.push('/auth/login?message=password_updated');
      }, 1500);
    }
    setLoading(false);
  };

  if (!tokenValidated && !error) {
    return <p className="text-center mt-10">Overujem odkaz na obnovu hesla...</p>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4 text-center">Obnova hesla</h1>

      {error && <div className="bg-red-100 text-red-800 p-2 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-800 p-2 rounded mb-4">{success}</div>}

      {tokenValidated && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Nové heslo"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border px-3 py-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="Potvrdiť nové heslo"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border px-3 py-2 rounded"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-2 rounded font-semibold"
          >
            {loading ? 'Zapisujem...' : 'Zmeniť heslo'}
          </button>
        </form>
      )}
    </div>
  );
}
