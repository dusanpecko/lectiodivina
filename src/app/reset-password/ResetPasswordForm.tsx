// app/reset-password/ResetPasswordForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Session } from '@supabase/supabase-js';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const handleAuthStateChange = () => {
      // Skontroluj či existuje reset token v URL
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');

      if (type === 'recovery' && accessToken && refreshToken) {
        // Nastav session s tokenmi z URL
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        }).then(({ data, error }) => {
          if (error) {
            setError('Neplatný alebo expirovaný reset link. Požiadajte o nový.');
          } else {
            setSession(data.session);
          }
          setIsValidating(false);
        });
      } else {
        // Skontroluj existujúcu session
        supabase.auth.getSession().then(({ data, error }) => {
          if (error) {
            setError('Chyba pri overovaní session.');
          } else if (!data.session) {
            setError('Neplatný alebo expirovaný reset link. Požiadajte o nový.');
          } else {
            setSession(data.session);
          }
          setIsValidating(false);
        });
      }
    };

    handleAuthStateChange();

    // Počúvaj na zmeny auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setSession(session);
          setError(null);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [searchParams]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return 'Heslo musí mať aspoň 6 znakov.';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Heslo musí obsahovať aspoň jedno malé písmeno.';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Heslo musí obsahovať aspoň jedno veľké písmeno.';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Heslo musí obsahovať aspoň jednu číslicu.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!password || !confirmPassword) {
      setError('Prosím zadajte a potvrďte nové heslo.');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (passwordValidation) {
      setError(passwordValidation);
      return;
    }

    if (password !== confirmPassword) {
      setError('Heslá sa nezhodujú.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (error) {
        // Spracuj rôzne typy chýb
        if (error.message.includes('session_not_found')) {
          setError('Session expirovala. Požiadajte o nový reset link.');
        } else if (error.message.includes('same_password')) {
          setError('Nové heslo musí byť odlišné od súčasného hesla.');
        } else {
          setError(error.message || 'Zmena hesla zlyhala.');
        }
      } else {
        setSuccess('Heslo bolo úspešne zmenené! Presmerovávam na prihlásenie...');
        
        // Vyčisti URL parametre
        window.history.replaceState({}, '', '/reset-password');
        
        // Odhlásiť používateľa a presmerovať
        await supabase.auth.signOut();
        setTimeout(() => {
          router.push('/login?message=password_updated');
        }, 2000);
      }
    } catch (err) {
      setError('Nastala neočakávaná chyba. Skúste to znova.');
      console.error('Password update error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (isValidating) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Overujem reset link...</p>
      </div>
    );
  }

  // Error state - neplatný token
  if (!session) {
    return (
      <div className="bg-white max-w-md mx-auto rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Neplatný reset link</h3>
            <p className="mt-2 text-sm text-gray-600">
              {error || 'Reset link je neplatný alebo expirovaný. Požiadajte o nový link na obnovenie hesla.'}
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/forgot-password')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Požiadať o nový reset link
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="bg-white max-w-md mx-auto rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Obnovenie hesla
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Zadajte svoje nové heslo
          </p>
        </div>
        
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Nové heslo
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Zadajte nové heslo"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Potvrdiť heslo
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Potvrďte nové heslo"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="text-xs text-gray-600">
            <p>Heslo musí obsahovať:</p>
            <ul className="mt-1 list-disc list-inside space-y-1">
              <li>Aspoň 6 znakov</li>
              <li>Jedno malé písmeno</li>
              <li>Jedno veľké písmeno</li>
              <li>Jednu číslicu</li>
            </ul>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Aktualizujem...
                </>
              ) : (
                'Zmeniť heslo'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}